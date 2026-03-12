import React from 'react';
import { motion } from 'framer-motion';
import { 
  VerifiedUser, EmojiEvents, Groups, MedicalServices, FormatQuote, School, WorkHistory 
} from '@mui/icons-material';
import PublicHeader from '../../components/Layout/PublicHeader';
import Footer from '../../components/Layout/Footer';
import { useNavigate } from 'react-router-dom';

const AboutPage = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-slate-50 min-h-screen font-sans text-slate-800 overflow-x-hidden">
      <PublicHeader />

      {/* --- 1. HERO SECTION: WHO WE ARE --- */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-24 bg-primary-dark text-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute -top-24 -right-24 w-[400px] h-[400px] bg-white/5 rounded-full blur-2xl pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <motion.div 
              initial={{ opacity: 0, y: 30 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.8 }}
            >
              <p className="text-accent font-bold tracking-widest text-sm mb-4 uppercase">
                ESTABLISHED 2023 • MATARA
              </p>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-poppins font-bold leading-tight mb-6">
                Who We Are
              </h1>
              <p className="text-lg text-primary-light mb-8 leading-relaxed font-light">
                Doctor C Dental Surgery is Matara's premier destination for advanced dental care. 
                Owned and led by Dr. Chasika Waduge, we combine clinical expertise from Sri Lanka's leading 
                hospitals with a gentle, patient-first approach.
              </p>
              <button 
                onClick={() => navigate('/contact')}
                className="bg-transparent border-2 border-accent text-accent hover:bg-accent hover:text-white px-8 py-3 rounded-full font-semibold transition-all duration-300"
              >
                Contact Us
              </button>
            </motion.div>
            
            <div>
              <img 
                src="https://images.unsplash.com/photo-1629909613654-28e377c37b09?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                alt="Clinic Interior"
                className="w-full rounded-3xl shadow-2xl object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* --- 2. MEET DR. CHASIKA WADUGE --- */}
      <section className="bg-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
            
            {/* Text Side */}
            <div className="md:col-span-8 md:col-start-3 lg:col-span-8 lg:col-start-3 mx-auto w-full max-w-3xl">
              <p className="text-accent font-bold tracking-widest text-sm mb-2 uppercase">
                LEAD DENTAL SURGEON
              </p>
              <h2 className="text-3xl sm:text-4xl font-poppins font-bold text-primary-dark mb-4">
                Dr. Chasika Waduge
              </h2>
              
              {/* Credentials Badges */}
              <div className="flex flex-wrap gap-3 mb-6">
                <div className="flex items-center gap-2 bg-primary-light text-white px-4 py-1.5 rounded-full text-sm font-medium">
                  <School fontSize="small" />
                  <span>University of Peradeniya</span>
                </div>
                <div className="flex items-center gap-2 bg-primary-light text-white px-4 py-1.5 rounded-full text-sm font-medium">
                  <MedicalServices fontSize="small" />
                  <span>BDS (Sri Lanka)</span>
                </div>
              </div>

              <p className="text-lg text-slate-600 leading-relaxed mb-6">
                Dr. Chasika Waduge is a highly experienced dental surgeon with a strong background in restorative dentistry and oral surgery. 
                A graduate of the prestigious <strong className="font-semibold text-slate-800">University of Peradeniya</strong>, she brings years of hospital-based experience to her private practice.
              </p>

              {/* Experience List */}
              <div className="mt-8 mb-10">
                <h3 className="text-xl font-bold text-primary-dark mb-4 flex items-center gap-2">
                  <WorkHistory /> Professional Experience
                </h3>
                <div className="space-y-4">
                  <div className="bg-slate-50 p-4 border-l-4 border-primary rounded-r-lg">
                    <p className="font-bold text-slate-800">SHO / Restorative Dentistry</p>
                    <p className="text-sm text-slate-500">New District General Hospital, Matara (Current)</p>
                  </div>
                  <div className="bg-slate-50 p-4 border-l-4 border-yellow-500 rounded-r-lg">
                    <p className="font-bold text-slate-800">Former SHO / Oral &amp; Maxillo-Facial Surgery</p>
                    <p className="text-sm text-slate-500">District General Hospital, Monaragala</p>
                  </div>
                  <div className="bg-slate-50 p-4 border-l-4 border-yellow-500 rounded-r-lg">
                    <p className="font-bold text-slate-800">Former HO / Oral &amp; Maxillo-Facial Surgery</p>
                    <p className="text-sm text-slate-500">District General Hospital, Hambantota</p>
                  </div>
                </div>
              </div>

              <hr className="border-slate-200 my-8" />

              <div className="flex items-start gap-4">
                 <FormatQuote className="text-accent opacity-50 text-5xl shrink-0" />
                 <p className="text-lg italic text-slate-700 font-medium leading-relaxed">
                   "My extensive training in hospital settings allows me to handle complex cases with confidence. 
                   At Doctor C, I strive to bring that same level of clinical excellence to every patient I treat."
                 </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* --- 3. MISSION & VISION --- */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Mission */}
          <div className="bg-teal-50 p-10 rounded-3xl border border-teal-100 flex flex-col h-full">
            <div className="w-16 h-16 bg-primary text-white rounded-2xl flex items-center justify-center mb-6 shadow-md">
              <VerifiedUser fontSize="large" />
            </div>
            <h3 className="text-3xl font-poppins font-bold text-primary-dark mb-4">
              Our Mission
            </h3>
            <p className="text-slate-600 leading-relaxed text-lg">
              To provide accessible, pain-free, and world-class dental services to the community of Matara, 
              empowering every patient with the confidence that comes from a healthy smile.
            </p>
          </div>
          
          {/* Vision */}
          <div className="bg-yellow-50 p-10 rounded-3xl border border-yellow-100 flex flex-col h-full">
            <div className="w-16 h-16 bg-accent text-primary-dark rounded-2xl flex items-center justify-center mb-6 shadow-md">
              <EmojiEvents fontSize="large" />
            </div>
            <h3 className="text-3xl font-poppins font-bold text-primary-dark mb-4">
              Our Vision
            </h3>
            <p className="text-slate-600 leading-relaxed text-lg">
              To be the leading dental healthcare provider in the Southern Province, recognized for 
              clinical excellence, technological innovation, and compassionate patient care.
            </p>
          </div>
        </div>
      </section>

      {/* --- 4. WHY CHOOSE US --- */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-poppins font-bold text-primary-dark">
            Why Choose Us?
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { title: "Hospital-Grade Expertise", desc: "Led by a specialist with extensive experience in government hospitals.", icon: <MedicalServices fontSize="large" /> },
            { title: "Comprehensive Care", desc: "From Restorative Dentistry to Oral Surgery, all under one roof.", icon: <Groups fontSize="large" /> },
            { title: "Patient Comfort", desc: "A relaxing environment designed to reduce anxiety.", icon: <VerifiedUser fontSize="large" /> },
          ].map((item, index) => (
            <motion.div 
              key={index}
              whileHover={{ y: -10 }}
              className="bg-white p-10 rounded-3xl text-center border border-slate-100 shadow-sm hover:shadow-xl transition-shadow duration-300"
            >
              <div className="w-20 h-20 bg-primary/5 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
                {item.icon}
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">{item.title}</h3>
              <p className="text-slate-500 leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AboutPage;