

## Plan: Implementación de Meta Tracking Híbrido (Browser + Server-Side via CAPI)

### Resumen Ejecutivo

Migrar el sistema de tracking de Meta desde `platform_connections` hacia `store_settings.meta_pixel_id`, e implementar tracking híbrido que envía eventos tanto al browser pixel como a una Edge Function centralizada (`meta-capi`) para la Conversions API.

---

### Arquitectura Propuesta

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                           STOREFRONT (Este Template)                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  1. SettingsContext                                                         │
│     └── Carga meta_pixel_id desde store_settings                            │
│                                                                              │
│  2. PixelContext (simplificado)                                             │
│     └── Inicializa fbq('init', pixelId)                                     │
│     └── Captura cookies _fbp y _fbc                                         │
│                                                                              │
│  3. tracking-utils.ts (modificado)                                          │
│     └── Genera event_id (UUID) único                                        │
│     └── Envía a Browser Pixel: fbq('track', event, data, {eventID})         │
│     └── Envía a Edge Function: callEdge('meta-capi', payload)               │
│                                                                              │
└──────────────────────────────┬──────────────────────────────────────────────┘
                               │
                               │ POST /functions/v1/meta-capi
                               ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                      SUPABASE "MADRE" (Edge Functions)                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Edge Function: meta-capi                                                   │
│  ├── Recibe: store_id, event_name, event_id, user_data, custom_data         │
│  ├── Busca: pixel_id + access_token en platform_connections                 │
│  ├── Formatea: Payload para Meta Graph API                                  │
│  └── POST: https://graph.facebook.com/v18.0/{pixel_id}/events               │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

### Archivos a Modificar/Eliminar

| Archivo | Acción | Descripción |
|---------|--------|-------------|
| `src/lib/supabase.ts` | **Modificar** | Agregar `meta_pixel_id` al tipo `StoreSettings` |
| `src/contexts/SettingsContext.tsx` | **Modificar** | Incluir `meta_pixel_id` en el query y exponerlo |
| `src/contexts/PixelContext.tsx` | **Modificar** | Simplificar: usar `meta_pixel_id` de Settings, capturar cookies `_fbp`/`_fbc` |
| `src/hooks/usePixelId.ts` | **Eliminar** | Ya no se necesita, el pixel viene de Settings |
| `src/lib/facebook-pixel.ts` | **Modificar** | Agregar soporte para `eventID` en todos los métodos |
| `src/lib/tracking-utils.ts` | **Modificar** | Implementar tracking híbrido con `event_id` y llamada a Edge Function |
| `src/App.tsx` | **Modificar** | Actualizar import si se elimina `usePixelId` |

---

### Cambios Detallados por Archivo

#### 1. `src/lib/supabase.ts`

Agregar `meta_pixel_id` al tipo `StoreSettings`:

```typescript
export type StoreSettings = {
  id: string
  store_id: string
  currency_code: string
  social_links?: any
  logos?: any
  store_language?: string
  date_format?: string
  shipping_coverage?: any
  pickup_locations?: any
  delivery_expectations?: any
  meta_pixel_id?: string  // ← NUEVO
  updated_at?: string
}
```

---

#### 2. `src/contexts/SettingsContext.tsx`

Modificar el query para incluir `meta_pixel_id` y exponerlo:

```typescript
// En fetchStoreSettings
const { data, error } = await supabase
  .from('store_settings')
  .select('..., meta_pixel_id')  // ← Agregar campo
  .eq('store_id', STORE_ID)
  .maybeSingle()

// En el contexto
interface SettingsContextType {
  // ... campos existentes
  metaPixelId: string | null  // ← NUEVO
}

// En el Provider
const metaPixelId = settings?.meta_pixel_id || null
```

---

#### 3. `src/contexts/PixelContext.tsx` (Refactorizar)

Simplificar para usar Settings en lugar de query separado:

```typescript
import { useSettings } from '@/contexts/SettingsContext'
import { facebookPixel } from '@/lib/facebook-pixel'

interface PixelContextType {
  pixelId: string | null
  fbp: string | null  // Cookie _fbp
  fbc: string | null  // Cookie _fbc
}

export function PixelProvider({ children }: { children: React.ReactNode }) {
  const { metaPixelId, isLoading } = useSettings()
  const [fbp, setFbp] = useState<string | null>(null)
  const [fbc, setFbc] = useState<string | null>(null)

  // Capturar cookies de Meta
  useEffect(() => {
    const getCookie = (name: string) => {
      const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'))
      return match ? match[2] : null
    }
    setFbp(getCookie('_fbp'))
    setFbc(getCookie('_fbc'))
  }, [])

  useEffect(() => {
    if (metaPixelId && !isLoading) {
      facebookPixel.init(metaPixelId)
      facebookPixel.pageView()
    }
  }, [metaPixelId, isLoading])

  return (
    <PixelContext.Provider value={{ pixelId: metaPixelId, fbp, fbc }}>
      {children}
    </PixelContext.Provider>
  )
}
```

---

#### 4. `src/hooks/usePixelId.ts`

**ELIMINAR** este archivo. Ya no se necesita porque el `meta_pixel_id` viene de `store_settings` a través de `SettingsContext`.

---

#### 5. `src/lib/facebook-pixel.ts`

Agregar soporte para `eventID` en todos los métodos:

```typescript
class FacebookPixelService {
  // ... código existente

  track(event: string, parameters?: Record<string, any>, eventId?: string) {
    if (!this.initialized) return
    if (eventId) {
      ReactPixel.track(event, parameters, { eventID: eventId })
    } else {
      ReactPixel.track(event, parameters)
    }
  }

  viewContent(parameters: {...}, eventId?: string) {
    this.track('ViewContent', parameters, eventId)
  }

  addToCart(parameters: {...}, eventId?: string) {
    this.track('AddToCart', parameters, eventId)
  }

  initiateCheckout(parameters: {...}, eventId?: string) {
    this.track('InitiateCheckout', parameters, eventId)
  }

  purchase(parameters: {...}, eventId?: string) {
    this.track('Purchase', parameters, eventId)
  }

  search(parameters: {...}, eventId?: string) {
    this.track('Search', parameters, eventId)
  }
}
```

---

#### 6. `src/lib/tracking-utils.ts` (Cambio Principal)

Implementar tracking híbrido con deduplicación:

```typescript
import { facebookPixel } from '@/lib/facebook-pixel'
import { callEdge } from '@/lib/edge'
import { STORE_ID } from '@/lib/config'
import posthog from 'posthog-js'

// Interfaz para datos de usuario CAPI
interface UserDataForCapi {
  fbp?: string
  fbc?: string
  client_user_agent: string
  em?: string  // Email hasheado SHA256
  ph?: string  // Teléfono hasheado SHA256
}

class TrackingUtility {
  private pixelId: string | null = null
  private fbp: string | null = null
  private fbc: string | null = null
  
  // Setter para datos del pixel (llamado desde PixelContext)
  setPixelData(pixelId: string | null, fbp: string | null, fbc: string | null) {
    this.pixelId = pixelId
    this.fbp = fbp
    this.fbc = fbc
  }

  // Generar UUID para deduplicación
  private generateEventId(): string {
    return crypto.randomUUID()
  }

  // Obtener datos de usuario para CAPI
  private getUserDataForCapi(): UserDataForCapi {
    return {
      fbp: this.fbp || undefined,
      fbc: this.fbc || undefined,
      client_user_agent: navigator.userAgent
    }
  }

  // Enviar evento al servidor (CAPI)
  private async sendToServer(
    eventName: string,
    eventId: string,
    customData: Record<string, any>
  ): Promise<void> {
    try {
      await callEdge('meta-capi', {
        store_id: STORE_ID,
        event_name: eventName,
        event_id: eventId,
        event_source_url: window.location.href,
        user_data: this.getUserDataForCapi(),
        custom_data: customData
      })
      this.log(`CAPI: ${eventName}`, { eventId })
    } catch (error) {
      this.logError(`CAPI: ${eventName}`, error)
    }
  }

  // Método híbrido principal
  private async trackHybrid(
    eventName: string,
    browserParams: Record<string, any>,
    customData: Record<string, any>
  ): Promise<void> {
    const eventId = this.generateEventId()

    // 1. Browser Pixel (si está disponible)
    if (this.pixelId) {
      facebookPixel.track(eventName, browserParams, eventId)
    }

    // 2. Server-side via Edge Function (fire and forget)
    this.sendToServer(eventName, eventId, customData)

    // 3. PostHog (si está cargado)
    if (this.isPostHogLoaded()) {
      posthog.capture(eventName.toLowerCase(), { ...customData, event_id: eventId })
    }
  }

  // Eventos específicos actualizados para usar tracking híbrido
  trackViewContent(params: TrackingParams): void {
    const browserParams = this.buildStandardParams(params)
    const customData = {
      content_ids: browserParams.content_ids,
      value: browserParams.value,
      currency: browserParams.currency
    }
    this.trackHybrid('ViewContent', browserParams, customData)
  }

  trackAddToCart(params: TrackingParams): void {
    const browserParams = this.buildStandardParams(params)
    const customData = {
      content_ids: browserParams.content_ids,
      value: browserParams.value,
      currency: browserParams.currency,
      num_items: params.num_items
    }
    this.trackHybrid('AddToCart', browserParams, customData)
  }

  trackInitiateCheckout(params: TrackingParams): void {
    const browserParams = { ...this.buildStandardParams(params), num_items: params.num_items }
    const customData = {
      content_ids: browserParams.content_ids,
      value: browserParams.value,
      currency: browserParams.currency,
      num_items: params.num_items
    }
    this.trackHybrid('InitiateCheckout', browserParams, customData)
  }

  trackPurchase(params: TrackingParams): void {
    const browserParams = this.buildStandardParams(params)
    const customData = {
      content_ids: browserParams.content_ids,
      value: browserParams.value,
      currency: browserParams.currency,
      order_id: params.order_id,
      ...params.custom_parameters
    }
    this.trackHybrid('Purchase', browserParams, customData)
  }

  // ... resto de métodos existentes
}
```

---

#### 7. `src/App.tsx`

Actualizar orden de providers (PixelProvider ahora depende de SettingsProvider):

```typescript
// El orden actual ya es correcto:
// SettingsProvider → PixelProvider → ...

// Solo eliminar el import de usePixelId si existiera
```

---

### Flujo de Datos Completo

1. **App carga** → `SettingsProvider` obtiene `meta_pixel_id` de `store_settings`
2. **PixelContext** → Recibe `metaPixelId`, inicializa `fbq`, captura cookies `_fbp`/`_fbc`
3. **Usuario interactúa** → `trackAddToCart()` es llamado
4. **tracking-utils** → Genera `event_id` UUID único
5. **Browser Pixel** → `fbq('track', 'AddToCart', {...}, {eventID: 'abc-123'})`
6. **Edge Function** → `callEdge('meta-capi', {event_id: 'abc-123', ...})`
7. **Meta** → Recibe ambos eventos, los deduplica por `event_id`

---

### Consideraciones Importantes

1. **Edge Function `meta-capi`**: Esta función debe existir en el Supabase "madre". Este template solo la llama via `callEdge()`.

2. **Fallback Graceful**: Si la Edge Function falla, el browser pixel sigue funcionando normalmente.

3. **Hashing de Email/Teléfono**: Para Advanced Matching, se puede agregar una función `hashSHA256()` que hashee email y teléfono antes de enviarlos al servidor.

4. **Orden de Providers**: `PixelProvider` DEBE estar dentro de `SettingsProvider` porque depende de `useSettings()`.

5. **No hay Edge Functions en este repo**: La Edge Function `meta-capi` vive en otro Supabase, solo se llama desde aquí.

---

### Resumen de Cambios

| Tipo | Cantidad |
|------|----------|
| Archivos a modificar | 5 |
| Archivos a eliminar | 1 |
| Líneas aproximadas de código nuevo | ~80 |
| Dependencias nuevas | 0 |

---

### Secuencia de Implementación

1. Modificar `src/lib/supabase.ts` (agregar tipo)
2. Modificar `src/contexts/SettingsContext.tsx` (incluir meta_pixel_id)
3. Modificar `src/lib/facebook-pixel.ts` (agregar eventID)
4. Modificar `src/lib/tracking-utils.ts` (tracking híbrido)
5. Refactorizar `src/contexts/PixelContext.tsx` (usar Settings, capturar cookies)
6. Eliminar `src/hooks/usePixelId.ts`
7. Verificar `src/App.tsx` (orden de providers)

