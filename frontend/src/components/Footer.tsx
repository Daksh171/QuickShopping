import { Link } from 'react-router-dom';
import { Zap, Headphones, ShieldCheck, Truck } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-16 border-t-3" style={{ borderTopWidth: '3px', borderTopColor: '#171717', backgroundColor: '#171717', color: '#fff' }}>
      {/* Features strip */}
      <div className="border-b" style={{ borderBottomColor: '#333' }}>
        <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Zap, label: '10 Minute Delivery', sub: 'Lightning fast' },
            { icon: ShieldCheck, label: 'Best Prices', sub: 'No hidden charges' },
            { icon: Truck, label: 'Free Delivery', sub: 'On orders above ₹199' },
            { icon: Headphones, label: '24/7 Support', sub: 'Always here for you' },
          ].map((f) => (
            <div key={f.label} className="flex items-center gap-3">
              <div className="w-10 h-10 flex items-center justify-center border-2" style={{ borderColor: '#FDE047', color: '#FDE047' }}>
                <f.icon size={20} />
              </div>
              <div>
                <p className="font-bold text-sm">{f.label}</p>
                <p className="text-xs text-gray-400">{f.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Links */}
      <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 flex items-center justify-center font-black text-sm" style={{ backgroundColor: '#FDE047', color: '#171717' }}>Q</div>
            <span className="font-black text-lg">QuickBasket</span>
          </div>
          <p className="text-sm text-gray-400">Your neighbourhood grocery store, now online. Fresh produce and essentials delivered in minutes.</p>
        </div>
        <div>
          <h4 className="font-bold text-sm uppercase tracking-wider mb-4" style={{ color: '#FDE047' }}>Company</h4>
          <ul className="space-y-2 text-sm text-gray-400">
            <li><Link to="/" className="hover:text-white transition-colors">About Us</Link></li>
            <li><Link to="/" className="hover:text-white transition-colors">Careers</Link></li>
            <li><Link to="/" className="hover:text-white transition-colors">Blog</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-sm uppercase tracking-wider mb-4" style={{ color: '#FDE047' }}>Help</h4>
          <ul className="space-y-2 text-sm text-gray-400">
            <li><Link to="/" className="hover:text-white transition-colors">Contact Us</Link></li>
            <li><Link to="/" className="hover:text-white transition-colors">FAQ</Link></li>
            <li><Link to="/" className="hover:text-white transition-colors">Delivery Info</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-sm uppercase tracking-wider mb-4" style={{ color: '#FDE047' }}>Legal</h4>
          <ul className="space-y-2 text-sm text-gray-400">
            <li><Link to="/" className="hover:text-white transition-colors">Privacy Policy</Link></li>
            <li><Link to="/" className="hover:text-white transition-colors">Terms of Service</Link></li>
            <li><Link to="/" className="hover:text-white transition-colors">Refund Policy</Link></li>
          </ul>
        </div>
      </div>

      {/* Bottom */}
      <div className="border-t" style={{ borderTopColor: '#333' }}>
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between text-xs text-gray-500">
          <p>© 2026 QuickBasket. All rights reserved.</p>
          <p>Made with 💛 for fast groceries</p>
        </div>
      </div>
    </footer>
  );
}
