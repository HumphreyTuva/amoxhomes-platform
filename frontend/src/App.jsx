import { useEffect, useState } from 'react';
import { Route, Routes, useParams } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import { getBoot, loadBoot } from './lib/api.js';
import { BlogDetail, BlogList } from './pages/Blog.jsx';
import FormPage from './pages/FormPage.jsx';
import Home from './pages/Home.jsx';
import HouseDetail from './pages/HouseDetail.jsx';
import Houses from './pages/Houses.jsx';
import NotFound from './pages/NotFound.jsx';
import Reviews from './pages/Reviews.jsx';
import { About, Landlords, Legal, Services } from './pages/Static.jsx';
import Thanks from './pages/Thanks.jsx';

function RequestPage() {
  const { kind } = useParams();
  return <FormPage apiPath={`/api/site/services/${kind}/`} postTo={`/api/site/request/${kind}/`} />;
}

export default function App() {
  const [ready, setReady] = useState(!!getBoot());
  useEffect(() => { if (!ready) loadBoot().then(() => setReady(true)); }, [ready]);
  if (!ready) return null;

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/houses" element={<Houses />} />
        <Route path="/houses/near/:institution" element={<Houses />} />
        <Route path="/houses/:slug" element={<HouseDetail />} />
        <Route path="/services" element={<Services />} />
        <Route path="/request/:kind" element={<RequestPage />} />
        <Route path="/landlords" element={<Landlords />} />
        <Route path="/landlords/list" element={<FormPage apiPath="/api/site/landlords/list/" postTo="/api/site/landlords/list/send/" />} />
        <Route path="/providers" element={<FormPage apiPath="/api/site/providers/" postTo="/api/site/providers/send/" />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<FormPage apiPath="/api/site/contact/" postTo="/api/site/contact/send/" />} />
        <Route path="/thanks" element={<Thanks />} />
        <Route path="/reviews" element={<Reviews />} />
        <Route path="/blog" element={<BlogList />} />
        <Route path="/blog/:slug" element={<BlogDetail />} />
        <Route path="/privacy" element={<Legal page="privacy" />} />
        <Route path="/terms" element={<Legal page="terms" />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  );
}
