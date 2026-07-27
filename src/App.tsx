import { BrowserRouter, Routes, Route, useLocation, Link, useNavigationType } from 'react-router-dom';
import { useEffect } from 'react';
import { Navbar, Footer } from './components/Layout';
import { AuthProvider } from './lib/AuthContext';
// Pages
import { HomePage }         from './pages/HomePage';
import { ShopLandingPage }  from './pages/ShopLandingPage';
import { ShopPage }         from './pages/ShopPage';          // Esquire — /shop/home
import { TechShopPage }     from './pages/TechShopPage';      // Syntech  — /shop/tech
import { AxizShopPage }     from './pages/AxizShopPage';      // Axiz     — /shop/axiz
import { AxizProductPage }  from './pages/AxizProductPage';   // Axiz     — /shop/axiz/product/:id
import { PinnacleShopPage }    from './pages/PinnacleShopPage';    // Pinnacle — /shop/pinnacle
import { PinnacleProductPage } from './pages/PinnacleProductPage'; // Pinnacle — /shop/pinnacle/product/:id
import { TechProductPage }  from './pages/TechProductPage';   // Syntech product detail
import { B2BPage }          from './pages/B2BPage';           // B2B placeholder
import { ProductPage }      from './pages/ProductPage';
import { CartPage }         from './pages/CartPage';
import { CheckoutPage }     from './pages/CheckoutPage';
import { DealsPage }        from './pages/DealsPage';
import { AdminPage }        from './pages/AdminPage';
import { AccountPage }      from './pages/AccountPage';
import { AuthPage }         from './pages/AuthPage';
import { CategoriesPage }   from './pages/CategoriesPage';
import { PaymentSuccess }   from './pages/PaymentSuccess';
import { PaymentCancel }    from './pages/PaymentCancel';
import { SearchPage }       from './pages/SearchPage';
import EnterprisePage       from './pages/EnterprisePage'
import EnterpriseRegisterPage from './pages/EnterpriseRegisterPage'
import EnterpriseLoginPage from './pages/EnterpriseLoginPage'
import EnterpriseHomePage from './pages/EnterpriseHomePage'
import EnterpriseDashboard from './pages/EnterpriseDashboard'
import EnterpriseProductsPage from './pages/EnterpriseProductsPage' 
import EnterpriseProductDetailPage from './pages/EnterpriseProductDetailPage'
import EnterpriseQuotesPage from './pages/EnterpriseQuotesPage'
import EnterpriseOrdersPage from './pages/EnterpriseOrdersPage'
import EnterpriseProcurementListsPage from './pages/EnterpriseProcurementListsPage'
import EnterpriseAccountPage from './pages/EnterpriseAccountPage'
import EnterpriseApplePage from './pages/EnterpriseApplePage'
import EnterpriseAppleDetailPage from './pages/EnterpriseAppleDetailPage'


// Scroll to top on forward navigation only — back/forward restores position
function ScrollToTop() {
  const { pathname } = useLocation();
  const navType = useNavigationType();
  useEffect(() => {
    if (navType !== 'POP') window.scrollTo(0, 0);
  }, [pathname, navType]);
  return null;
}

function AppShell() {
  const { pathname } = useLocation();
  const isEnterprise = pathname.startsWith('/enterprise');

  return (
    <>
      <ScrollToTop />
      {!isEnterprise && <Navbar />}
      <main>
        <Routes>
          <Route path="/"                element={<HomePage />} />

          {/* ── Shop routes ── */}
          <Route path="/shop"            element={<ShopLandingPage />} />
          <Route path="/shop/home"       element={<ShopPage />} />
          <Route path="/shop/tech"       element={<TechShopPage />} />
          <Route path="/shop/tech/product/:id" element={<TechProductPage />} />
          <Route path="/shop/axiz"       element={<AxizShopPage />} />
          <Route path="/shop/axiz/product/:id" element={<AxizProductPage />} />
          <Route path="/shop/pinnacle"       element={<PinnacleShopPage />} />
          <Route path="/shop/pinnacle/product/:id" element={<PinnacleProductPage />} />
          <Route path="/b2b"             element={<B2BPage />} />
          <Route path="/enterprise"      element={<EnterprisePage />} />
          <Route path="/enterprise/apple" element={<EnterpriseApplePage />} />
          <Route path="/enterprise/apple/:id" element={<EnterpriseAppleDetailPage />} />
          <Route path="/enterprise/register" element={<EnterpriseRegisterPage />} />
          <Route path="/enterprise/login" element={<EnterpriseLoginPage />} />
          <Route path="/enterprise/home" element={<EnterpriseHomePage />} />
          <Route path="/enterprise/dashboard" element={<EnterpriseDashboard />} />
          <Route path="/enterprise/lists" element={<EnterpriseProcurementListsPage />} />
          <Route path="/enterprise/products" element={<EnterpriseProductsPage />} />
          <Route path="/enterprise/products/:source/:id" element={<EnterpriseProductDetailPage />} />
          <Route path="/enterprise/quotes" element={<EnterpriseQuotesPage />} />
          <Route path="/enterprise/orders" element={<EnterpriseOrdersPage />} />
          <Route path="/enterprise/account" element={<EnterpriseAccountPage />} />
          {/* ── Product, deals, account ── */}
          <Route path="/product/:slug"   element={<ProductPage />} />
          <Route path="/categories"      element={<CategoriesPage />} />
          <Route path="/deals"           element={<DealsPage />} />
          <Route path="/admin"           element={<AdminPage />} />
          <Route path="/cart"            element={<CartPage />} />
          <Route path="/checkout"        element={<CheckoutPage />} />
          <Route path="/account"         element={<AccountPage />} />
          <Route path="/auth"            element={<AuthPage />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/payment-cancel"  element={<PaymentCancel />} />
          <Route path="/search"          element={<SearchPage />} />

          {/* Catch-all 404 */}
          <Route path="*" element={
            <div className="min-h-screen bg-gray-50 dark:bg-[#0a141d] pt-40 flex flex-col items-center justify-center text-center px-4">
              <p className="text-8xl font-black text-gray-200 dark:text-lago-800 mb-4">404</p>
              <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white mb-4">Page not found</h1>
              <p className="text-gray-500 dark:text-lago-400 mb-8">The page you're looking for doesn't exist.</p>
              <a href="/" className="px-8 py-3 rounded-full bg-lago-600 text-white font-bold hover:bg-lago-700 transition-colors">
                Go Home
              </a>
            </div>
          } />
        </Routes>
      </main>
      {!isEnterprise && <Footer />}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppShell />
      </AuthProvider>
    </BrowserRouter>
  );
}
