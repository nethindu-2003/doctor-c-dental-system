import React from 'react';
import { motion } from 'framer-motion';
import { 
  Phone, Email, LocationOn, Send, 
} from '@mui/icons-material';
import PublicHeader from '../../components/Layout/PublicHeader';
import Footer from '../../components/Layout/Footer';
import { useClinic } from '../../context/ClinicContext';

const ContactPage = () => {
  const { config } = useClinic();
  return (
    <div className="bg-slate-50 min-h-screen font-sans text-slate-800 overflow-x-hidden flex flex-col">
      
      {/* 1. Header */}
      <PublicHeader />

      {/* 2. Page Content Wrapper */}
      <main className="flex-1 pt-24 md:pt-32 pb-16">
        
        {/* --- HERO / TITLE SECTION --- */}
        <section className="bg-primary-dark text-white py-16 md:py-20 text-center px-4">
          <div className="max-w-3xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: -20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.8 }}
            >
              <p className="text-accent font-bold tracking-widest text-sm mb-4 uppercase">
                WE ARE HERE FOR YOU
              </p>
              <h1 className="text-4xl md:text-5xl font-poppins font-bold mb-6">
                Get in Touch
              </h1>
              <p className="text-lg text-primary-light font-light max-w-2xl mx-auto leading-relaxed">
                Have questions about our services or need to schedule an appointment? 
                Our team in Matara is ready to assist you.
              </p>
            </motion.div>
          </div>
        </section>

        {/* --- SPLIT CONTENT SECTION --- */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* LEFT: Contact Form */}
            <div className="lg:col-span-7">
              <motion.div 
                initial={{ opacity: 0, x: -30 }} 
                animate={{ opacity: 1, x: 0 }} 
                transition={{ duration: 0.8 }}
                className="bg-white p-8 md:p-10 rounded-3xl border border-slate-200 shadow-sm"
              >
                <h2 className="text-2xl md:text-3xl font-poppins font-bold text-primary-dark mb-2">
                  Send us a Message
                </h2>
                <p className="text-slate-500 mb-8">
                  Fill out the form below and we will get back to you within 24 hours.
                </p>

                <form className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">First Name</label>
                      <input 
                        type="text" 
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                        placeholder="John"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Last Name</label>
                      <input 
                        type="text" 
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                        placeholder="Doe"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
                    <input 
                      type="email" 
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                      placeholder="john@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Phone Number</label>
                    <input 
                      type="tel" 
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                      placeholder="+94 77 123 4567"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Message</label>
                    <textarea 
                      rows="4"
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
                      placeholder="How can we help you?"
                    ></textarea>
                  </div>

                  <button 
                    type="button"
                    className="bg-primary hover:bg-primary-dark text-white px-8 py-4 rounded-full font-semibold shadow-lg shadow-primary/30 transition-all duration-300 flex items-center justify-center w-full md:w-auto hover:-translate-y-1"
                  >
                    Send Message
                    <Send className="ml-2" fontSize="small" />
                  </button>
                </form>

              </motion.div>
            </div>

            {/* RIGHT: Info & Map Visual */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              <motion.div 
                initial={{ opacity: 0, x: 30 }} 
                animate={{ opacity: 1, x: 0 }} 
                transition={{ duration: 0.8, delay: 0.2 }}
                className="flex flex-col gap-6"
              >
                
                {/* Info Cards Stack */}
                
                {/* Address Card */}
                <div className="bg-slate-100 p-6 rounded-3xl flex items-center border border-slate-200">
                  <div className="w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center shrink-0 mr-4 shadow-sm">
                    <LocationOn />
                  </div>
                  <div>
                    <h3 className="font-bold text-primary-dark text-lg mb-1">Visit Us</h3>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      {config.clinicAddress || 'Address not available'}
                    </p>
                  </div>
                </div>

                {/* Contact Card */}
                <div className="bg-slate-100 p-6 rounded-3xl flex items-center border border-slate-200">
                  <div className="w-14 h-14 bg-accent text-primary-dark rounded-full flex items-center justify-center shrink-0 mr-4 shadow-sm">
                    <Phone />
                  </div>
                  <div>
                    <h3 className="font-bold text-primary-dark text-lg mb-1">Call Us</h3>
                    <p className="text-slate-600 font-medium">{config.clinicPhone || 'Phone not available'}</p>
                  </div>
                </div>

                {/* Email Card */}
                <div className="bg-slate-100 p-6 rounded-3xl flex items-center border border-slate-200">
                  <div className="w-14 h-14 bg-primary-light text-white rounded-full flex items-center justify-center shrink-0 mr-4 shadow-sm">
                    <Email />
                  </div>
                  <div>
                    <h3 className="font-bold text-primary-dark text-lg mb-1">Email Us</h3>
                    <p className="text-slate-600 text-sm">{config.clinicEmail || 'Email not available'}</p>
                  </div>
                </div>

                {/* Visual Map Placeholder */}
                <div 
                  className="h-56 rounded-3xl overflow-hidden relative flex items-center justify-center bg-cover bg-center shadow-inner"
                  style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1569336415962-a4bd9f69cd83?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80)' }}
                >
                  <div className="absolute inset-0 bg-primary-dark/60 mix-blend-multiply" />
                  <a 
                    href="https://maps.app.goo.gl/8jhfHCNLHC23iP648" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="relative z-10 border-2 border-white text-white hover:bg-white hover:text-primary-dark px-6 py-3 rounded-full font-semibold transition-colors duration-300"
                  >
                    View on Google Maps
                  </a>
                </div>

              </motion.div>
            </div>

          </div>
        </section>
      </main>

      {/* 3. Footer */}
      <Footer />
    </div>
  );
};

export default ContactPage;