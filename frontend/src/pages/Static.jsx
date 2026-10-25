import { Link } from 'react-router-dom';
import { Icon } from '../components/Icons.jsx';
import Reveal from '../components/Reveal.jsx';
import { getBoot, useMeta } from '../lib/api.js';

export function Services() {
  const b = getBoot();
  useMeta('Internet, Gas, Mattress Hire & Moving Help in Malindi | AMOXHomes');
  return (
    <>
      <section className="bg-mist py-10"><div className="max-w-6xl mx-auto px-4"><h1 className="text-3xl font-extrabold text-navy">Our services</h1><p className="mt-1 max-w-2xl text-slate-600">From Wi-Fi and gas to furniture and movers, we arrange what you need to settle into your new home.</p></div></section>
      <div className="max-w-6xl mx-auto px-4 mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {b.services.map((s, i) => (
          <Reveal as={Link} key={s.key} to={`/request/${s.key}/`} d={i} className="lift zoom flex items-center gap-4 bg-white border rounded-2xl p-4">
            <span className="block shrink-0 overflow-hidden rounded-xl"><img src={s.key === 'house' ? b.assets.menu_house : b.assets[s.key]} alt="" width="144" height="112" loading="lazy" className="h-24 w-28 sm:h-28 sm:w-36 object-cover" /></span>
            <span><h2 className="font-bold text-navy leading-snug">{s.title}</h2><p className="text-sm text-slate-600 mt-1">{s.intro}</p><span className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-brand">Make a request <Icon n="arrow" className="h-4 w-4" /></span></span>
          </Reveal>
        ))}
      </div>
      <div className="max-w-6xl mx-auto px-4 mt-8"><div className="bg-navy text-white rounded-2xl p-6"><h2 className="text-2xl font-extrabold">AMOX Move-In Package</h2><p className="text-blue-100 mt-1">A house, movers, a mattress, gas and internet, all arranged together for you.</p><a href={b.wa_package} target="_blank" rel="noopener" className="inline-block mt-4 bg-green-600 font-semibold rounded-full px-5 py-2">Ask about the package</a></div></div>
    </>
  );
}

export function Landlords() {
  const b = getBoot();
  useMeta('List Your Property in Malindi | AMOXHomes');
  return (
    <>
      <section className="bg-mist py-10"><div className="max-w-6xl mx-auto px-4"><h1 className="text-3xl font-extrabold text-navy">For landlords</h1><p className="text-slate-600">Reach students and professionals moving to Malindi and Kilifi.</p><Link to="/landlords/list/" className="inline-block mt-4 bg-coral font-semibold rounded-full px-6 py-3">List Your Property</Link></div></section>
      <div className="max-w-6xl mx-auto px-4 mt-8 grid gap-4 md:grid-cols-3">
        <div className="bg-white border rounded-2xl p-5"><h2 className="font-bold text-navy">Basic listing: free</h2><p className="text-sm text-slate-600">Contact details, house details, rent, deposit, 2 photos and vacancy count.</p></div>
        <div className="bg-white border rounded-2xl p-5"><h2 className="font-bold text-navy">Pro listing</h2><p className="text-sm text-slate-600">Unlimited photos, videos of the interior, surroundings and walkway, advertising and top placement.</p></div>
        <div className="bg-white border rounded-2xl p-5"><h2 className="font-bold text-navy">✓ AMOX Verified</h2><p className="text-sm text-slate-600">For landlords we have worked with and confirmed to be reliable and cooperative.</p></div>
      </div>
      <div className="max-w-6xl mx-auto px-4 mt-8"><h2 className="text-2xl font-extrabold text-navy">How it works</h2>
        <ol className="grid gap-4 md:grid-cols-3 mt-4 list-decimal list-inside marker:font-bold marker:text-brand">
          <li className="bg-white border rounded-2xl p-5"><b className="text-navy">Send your house details</b><p className="text-sm text-slate-600 mt-1">Fill in the listing form with rent, deposit and photos.</p></li>
          <li className="bg-white border rounded-2xl p-5"><b className="text-navy">We review it</b><p className="text-sm text-slate-600 mt-1">Approved listings go live and tenants can request a connection.</p></li>
          <li className="bg-white border rounded-2xl p-5"><b className="text-navy">Meet tenants</b><p className="text-sm text-slate-600 mt-1">We introduce you to people who match your house.</p></li>
        </ol>
        <a href={b.wa_landlord} target="_blank" rel="noopener" className="inline-block mt-5 bg-green-600 text-white font-semibold rounded-full px-6 py-3">Ask about Pro listing or verification</a>
      </div>
    </>
  );
}

export function About() {
  useMeta('About Us | AMOXHomes');
  return (
    <>
      <section className="bg-mist py-10"><div className="max-w-6xl mx-auto px-4"><h1 className="text-3xl font-extrabold text-navy">About Us</h1><p className="text-slate-600">We are a division of AMOX Solutions Limited.</p></div></section>
      <div className="max-w-6xl mx-auto px-4 mt-8"><div className="bg-sand border-l-4 border-coral rounded-xl p-5">
        <p className="text-slate-700 mb-3">AMOXHomes is established to address challenges surrounding housing and settlement. Our initial focus is on students and professionals, particularly individuals coming to Malindi for university, college, attachment, internship, employment, business or other opportunities.</p>
        <p className="text-slate-700">AMOXHomes works with landlords, property owners, internet providers, household item providers, moving services and other relevant businesses, creating an interconnected housing ecosystem.</p>
      </div></div>
      <div className="max-w-6xl mx-auto px-4 mt-8 grid gap-4 md:grid-cols-2">
        <div className="bg-white border rounded-2xl p-5"><h2 className="font-bold text-navy">Vision</h2><p>To become Africa's trusted platform for housing connections and settlement support for students and professionals relocating to new places.</p></div>
        <div className="bg-white border rounded-2xl p-5"><h2 className="font-bold text-navy">Mission</h2><p>To make finding a home and settling into a new place simple and convenient.</p></div>
      </div>
      <div className="max-w-6xl mx-auto px-4 mt-8"><div className="flex flex-wrap gap-3 mt-6">
        <Link to="/houses/" className="bg-brand text-white font-semibold rounded-full px-6 py-3">Find a House</Link>
        <Link to="/contact/" className="border-2 border-navy text-navy font-semibold rounded-full px-6 py-3">Contact us</Link>
      </div></div>
    </>
  );
}

export function Legal({ page }) {
  const b = getBoot();
  const privacy = page === 'privacy';
  useMeta(`${privacy ? 'Privacy Policy' : 'Terms of Use'} | AMOXHomes`);
  return (
    <article className="max-w-3xl mx-auto px-4 py-10 space-y-3 text-slate-700">
      {privacy ? (
        <>
          <h1 className="text-3xl font-extrabold text-navy">Privacy Policy</h1>
          <p>AMOXHomes, a division of AMOX Solutions Ltd, collects the details you give us (name, phone, email, requirements and, for landlords, property details and photos) so we can find houses and services for you and contact you about them.</p>
          <p>We share your name and phone with a landlord or service provider only when you ask us to connect you. We do not sell your data.</p>
          <p>We keep your details while we are helping you and for as long as needed to run the service. Under the Data Protection Act, 2019 you may ask to see, correct or delete your data by writing to <a className="underline" href={`mailto:${b.email}`}>{b.email}</a>.</p>
        </>
      ) : (
        <>
          <h1 className="text-3xl font-extrabold text-navy">Terms of Use</h1>
          <p>AMOXHomes connects tenants with landlords and service providers. We are a connection platform and do not own, rent or guarantee the properties or services listed.</p>
          <p>Listings can change. Always view a house and confirm the landlord before you pay a deposit or rent. Do not pay anyone who is not verified, and report suspicious listings to us.</p>
          <p>Landlords and providers must give accurate information. We may reject, edit or remove any listing or account.</p>
        </>
      )}
      <p className="text-xs text-slate-400">Draft text. Have it reviewed by a lawyer before launch.</p>
    </article>
  );
}
