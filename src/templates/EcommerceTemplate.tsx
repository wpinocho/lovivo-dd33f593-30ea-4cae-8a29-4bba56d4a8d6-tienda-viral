import { ReactNode, useState, useEffect } from 'react'
import { PageTemplate } from './PageTemplate'
import { BrandLogoLeft } from '@/components/BrandLogoLeft'
import { SocialLinks } from '@/components/SocialLinks'
import { FloatingCart } from '@/components/FloatingCart'
import { ProfileMenu } from '@/components/ProfileMenu'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ShoppingCart, Menu, X, ChevronRight } from 'lucide-react'
import { useCartUISafe } from '@/components/CartProvider'
import { useCart } from '@/contexts/CartContext'
import { useCollections } from '@/hooks/useCollections'
import { ScrollLink } from '@/components/ScrollLink'

/**
 * EDITABLE TEMPLATE - EcommerceTemplate
 *
 * Template específico para páginas de ecommerce con header, footer y cart.
 */

const ANNOUNCEMENT_ITEMS = [
  '🚚 Envío GRATIS en compras +$500 MXN',
  '✨ Resultados visibles en 8 horas',
  '🔬 Tecnología clínicamente probada',
  '💝 Garantía 100% satisfacción',
  '🎁 15% OFF en tu primera compra — Código: GLOW15',
]

interface EcommerceTemplateProps {
  children: ReactNode
  pageTitle?: string
  showCart?: boolean
  className?: string
  headerClassName?: string
  footerClassName?: string
  layout?: 'default' | 'full-width' | 'centered'
}

export const EcommerceTemplate = ({
  children,
  pageTitle,
  showCart = true,
  className,
  headerClassName,
  footerClassName,
  layout = 'default',
}: EcommerceTemplateProps) => {
  const cartUI = useCartUISafe()
  const openCart = cartUI?.openCart ?? (() => {})
  const { getTotalItems } = useCart()
  const totalItems = getTotalItems()
  const { hasCollections, loading: loadingCollections } = useCollections()

  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileMenuOpen])

  const closeMobileMenu = () => setMobileMenuOpen(false)

  const navLinks = [
    ...(!loadingCollections && hasCollections
      ? [{ label: 'Colecciones', to: '/#collections', isScroll: true }]
      : []),
    { label: 'Productos', to: '/#products', isScroll: true },
    { label: 'Blog & Consejos', to: '/blog', isScroll: false },
    { label: '¿Cómo Funciona?', to: '/#benefits', isScroll: true },
  ]

  const header = (
    <div className={headerClassName}>
      {/* ── Announcement Bar ── */}
      <div className="bg-gradient-to-r from-primary to-accent overflow-hidden">
        <div className="flex py-2.5">
          <div className="announcement-marquee flex whitespace-nowrap select-none">
            {[...ANNOUNCEMENT_ITEMS, ...ANNOUNCEMENT_ITEMS].map((item, i) => (
              <span
                key={i}
                className="text-primary-foreground text-[11px] font-semibold tracking-wide px-10"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main Header ── */}
      <div
        className={`bg-white transition-all duration-300 ${
          scrolled
            ? 'shadow-[0_2px_20px_rgba(0,0,0,0.08)] border-b border-border/20'
            : 'border-b border-border/10'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16 lg:h-[72px]">
            {/* Logo */}
            <div className="flex-shrink-0 mr-8">
              <BrandLogoLeft />
            </div>

            {/* Desktop Nav — centered */}
            <nav className="hidden lg:flex flex-1 justify-center items-center">
              {navLinks.map((link) =>
                link.isScroll ? (
                  <ScrollLink
                    key={link.to}
                    to={link.to}
                    className="nav-link px-4 py-2 text-[13px] font-medium text-foreground/60 hover:text-primary transition-colors duration-200 rounded-lg hover:bg-primary/5"
                  >
                    {link.label}
                  </ScrollLink>
                ) : (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="nav-link px-4 py-2 text-[13px] font-medium text-foreground/60 hover:text-primary transition-colors duration-200 rounded-lg hover:bg-primary/5"
                  >
                    {link.label}
                  </Link>
                )
              )}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-0.5 ml-auto">
              <ProfileMenu />

              {showCart && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={openCart}
                  className="relative rounded-full hover:bg-primary/10 w-10 h-10"
                  aria-label="Ver carrito"
                >
                  <ShoppingCart className="h-[18px] w-[18px] text-foreground/65" />
                  {totalItems > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-primary text-primary-foreground text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center shadow-sm leading-none">
                      {totalItems > 99 ? '99+' : totalItems}
                    </span>
                  )}
                </Button>
              )}

              {/* Mobile Hamburger */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden rounded-full hover:bg-primary/10 w-10 h-10"
                aria-label="Abrir menú"
              >
                <Menu className="h-5 w-5 text-foreground/65" />
              </Button>
            </div>
          </div>
        </div>

        {/* Page Title */}
        {pageTitle && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4">
            <h1 className="text-3xl font-bold text-foreground">{pageTitle}</h1>
          </div>
        )}
      </div>
    </div>
  )

  const footer = (
    <div className={`bg-foreground py-16 ${footerClassName ?? ''}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <span className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              GlowPatch
            </span>
            <p className="mt-4 text-background/50 text-sm leading-relaxed max-w-xs">
              Tecnología de microagujas disolvibles para una piel más joven y luminosa.
              Resultados visibles clínicamente probados. Ahora en México.
            </p>
            <div className="mt-6">
              <SocialLinks />
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-background/80 font-semibold text-xs uppercase tracking-widest mb-5">
              Navegación
            </h4>
            <ul className="space-y-3">
              {[
                { label: 'Inicio', to: '/' },
                { label: 'Colecciones', to: '/#collections' },
                { label: 'Productos', to: '/#products' },
                { label: 'Blog & Consejos', to: '/blog' },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-background/45 hover:text-primary text-sm transition-colors duration-200 group flex items-center gap-1"
                  >
                    <span className="group-hover:translate-x-1 transition-transform duration-200 inline-block">
                      {link.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-background/80 font-semibold text-xs uppercase tracking-widest mb-5">
              Información
            </h4>
            <ul className="space-y-3">
              {[
                'Envíos & Entregas',
                'Devoluciones',
                'Política de Privacidad',
                'Términos y Condiciones',
                'Contacto',
              ].map((label) => (
                <li key={label}>
                  <Link
                    to="/"
                    className="text-background/45 hover:text-primary text-sm transition-colors duration-200"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-background/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-background/35 text-xs">
            &copy; 2025 GlowPatch México. Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-2">
            <span className="text-background/30 text-xs">Pagos seguros:</span>
            {['VISA', 'MC', 'AMEX', 'OXXO', 'Stripe'].map((method) => (
              <span
                key={method}
                className="text-background/50 text-[10px] font-semibold bg-background/10 border border-background/10 px-2 py-1 rounded"
              >
                {method}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <>
      <PageTemplate
        header={header}
        footer={footer}
        className={className}
        layout={layout}
      >
        {children}
      </PageTemplate>

      {showCart && <FloatingCart />}

      {/* ── Mobile Menu Drawer ── */}
      <div
        className={`fixed inset-0 z-[100] lg:hidden transition-all duration-300 ${
          mobileMenuOpen ? 'visible' : 'invisible pointer-events-none'
        }`}
      >
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-foreground/60 backdrop-blur-sm transition-opacity duration-300 ${
            mobileMenuOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={closeMobileMenu}
        />

        {/* Drawer panel */}
        <div
          className={`absolute right-0 top-0 h-full w-[300px] bg-background shadow-2xl flex flex-col transition-transform duration-300 ease-out ${
            mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          {/* Drawer header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-border/50">
            <BrandLogoLeft />
            <Button
              variant="ghost"
              size="icon"
              onClick={closeMobileMenu}
              className="rounded-full hover:bg-muted w-9 h-9"
            >
              <X className="h-5 w-5 text-foreground/60" />
            </Button>
          </div>

          {/* Drawer links */}
          <nav className="flex-1 px-4 py-5 overflow-y-auto space-y-1">
            {navLinks.map((link) =>
              link.isScroll ? (
                <ScrollLink
                  key={link.to}
                  to={link.to}
                  onClick={closeMobileMenu}
                  className="flex items-center justify-between w-full px-4 py-3.5 rounded-xl text-foreground/75 hover:text-primary hover:bg-primary/5 font-medium text-sm transition-all duration-200 group"
                >
                  {link.label}
                  <ChevronRight className="h-4 w-4 text-foreground/25 group-hover:text-primary/50 group-hover:translate-x-0.5 transition-all" />
                </ScrollLink>
              ) : (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={closeMobileMenu}
                  className="flex items-center justify-between w-full px-4 py-3.5 rounded-xl text-foreground/75 hover:text-primary hover:bg-primary/5 font-medium text-sm transition-all duration-200 group"
                >
                  {link.label}
                  <ChevronRight className="h-4 w-4 text-foreground/25 group-hover:text-primary/50 group-hover:translate-x-0.5 transition-all" />
                </Link>
              )
            )}

            {/* Promo card */}
            <div className="mt-6 p-4 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20">
              <p className="text-sm font-semibold text-foreground mb-1">🎁 15% de descuento</p>
              <p className="text-xs text-muted-foreground mb-3">
                En tu primera compra. Usa el código:
              </p>
              <div className="bg-white rounded-lg px-3 py-2 text-center border border-primary/30">
                <code className="text-primary font-bold text-sm tracking-widest">GLOW15</code>
              </div>
            </div>
          </nav>

          {/* Drawer footer */}
          <div className="px-5 py-4 border-t border-border/50">
            <div className="mb-3">
              <SocialLinks />
            </div>
            <p className="text-xs text-muted-foreground">© 2025 GlowPatch México</p>
          </div>
        </div>
      </div>
    </>
  )
}