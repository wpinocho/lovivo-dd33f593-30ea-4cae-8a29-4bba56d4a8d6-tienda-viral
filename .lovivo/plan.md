# GlowPatch México — Plan de Tienda

## Estado Actual
Tienda funcional de parches de microagujas (viral en TikTok). Lista para vender. Supabase NO conectado.

## Cambios Recientes
- **Menú profesional (Feb 2025)**: Rediseño completo del EcommerceTemplate
  - Barra de anuncios con marquee animado (gradiente primary→accent)
  - Header sticky con efecto sombra al hacer scroll
  - Nav desktop con underline hover animado (CSS .nav-link)
  - Menú móvil tipo drawer (slide from right, 300px, con backdrop blur)
  - Footer oscuro (bg-foreground) con 4 columnas + métodos de pago
  - Tarjeta promocional GLOW15 en menú móvil
  - PageTemplate simplificado (header sin bg/border hardcodeado)
  - ScrollLink actualizado para aceptar prop onClick
  - FloatingCart duplicado eliminado de IndexUI

## Archivos Modificados
- `src/templates/EcommerceTemplate.tsx` — Rediseño completo
- `src/templates/PageTemplate.tsx` — Header wrapper sin estilos hardcodeados
- `src/components/ScrollLink.tsx` — Añadido prop onClick opcional
- `src/pages/ui/IndexUI.tsx` — Eliminado FloatingCart duplicado
- `src/index.css` — Animaciones marquee + nav-link hover underline

## Preferencias del Usuario
- Tienda de skincare premium (GlowPatch México)
- Parches de microagujas virales en TikTok
- Quiere diseño nivel internacional, muy profesional
- Target: mujeres 18-45 México
- Va a vender desde hoy — necesita todo listo

## Producto
- Parches de microagujas disolvibles para piel
- Código de descuento: GLOW15 (15% OFF primera compra)
- Envío gratis +$500 MXN