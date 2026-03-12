import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowBack } from '@mui/icons-material';
import PublicHeader from '../../components/Layout/PublicHeader';
import Footer from '../../components/Layout/Footer';

// Updated Data Dictionary with Real Services
const serviceData = {
  'extraction': {
    title: "Extraction",
    subtitle: "Painless Tooth Removal",
    desc: "While we always strive to save your natural teeth, extraction is sometimes necessary for severely decayed, damaged, or infected teeth. We perform both simple and surgical extractions using modern anesthesia techniques to ensure a comfortable and painless experience.",
    features: [
      "Safe removal of severely decayed teeth",
      "Removal of impacted wisdom teeth",
      "Preparation for orthodontic treatment",
      "Post-procedure care guidance"
    ]
  },
  'scaling': {
    title: "Scaling & Polishing",
    subtitle: "Professional Deep Cleaning",
    desc: "Routine brushing isn't always enough to remove stubborn plaque and tartar (calculus). Our professional scaling service removes these harmful deposits from your teeth and gum line, preventing gum disease (gingivitis) and bad breath, leaving your teeth smooth and clean.",
    features: [
      "Removes hard tartar and plaque buildup",
      "Prevents gum disease and bleeding",
      "Eliminates bad breath (halitosis)",
      "Polishing for a smooth, shiny finish"
    ]
  },
  'root-filling': {
    title: "Root Filling (RCT)",
    subtitle: "Endodontic Therapy",
    desc: "Save your natural tooth rather than extracting it. Root filling (Root Canal Treatment) treats the infection at the center of the tooth (the pulp). We remove the infected tissue, clean the canal, and seal it to stop pain and restore the tooth's function.",
    features: [
      "Relieves severe toothache and sensitivity",
      "Saves the natural tooth structure",
      "Prevents infection from spreading to the bone",
      "High-standard sealing materials"
    ]
  },
  'denture': {
    title: "Dentures",
    subtitle: "Removable Teeth Replacement",
    desc: "Regain your ability to eat and speak comfortably with our custom-made dentures. We offer both complete dentures (for all teeth) and partial dentures (for a few missing teeth). Our modern dentures are lightweight, natural-looking, and fit securely.",
    features: [
      "Full and Partial denture options",
      "Acrylic and metal framework choices",
      "Restores facial shape and smile",
      "Affordable tooth replacement solution"
    ]
  },
  'orthodontic': {
    title: "Orthodontic Treatment",
    subtitle: "Braces & Alignment",
    desc: "Correct crooked teeth, gaps, and bite issues with our orthodontic solutions. Whether you need traditional metal braces for complex corrections or modern clear aligners for a discreet look, we help you achieve a perfectly aligned and functional smile.",
    features: [
      "Correction of crowded or crooked teeth",
      "Fixes overbites, underbites, and crossbites",
      "Metal and Ceramic braces available",
      "Improves long-term jaw health"
    ]
  },
  'surgery': {
    title: "Minor Oral Surgery",
    subtitle: "Surgical Dental Procedures",
    desc: "Our clinic is equipped to handle minor surgical procedures safely. This includes the removal of impacted wisdom teeth, cyst removal, biopsies, and pre-prosthetic surgery to prepare your mouth for dentures or implants.",
    features: [
      "Surgical removal of impacted wisdom teeth",
      "Soft tissue surgery and biopsies",
      "Frenectomy (Tongue-tie release)",
      "Safe and sterile surgical environment"
    ]
  },
  'restoration': {
    title: "Restoration",
    subtitle: "Composite & GIC Fillings",
    desc: "Repair cavities and chipped teeth with our tooth-colored restorations. We use high-quality Composite (light-cured) resins that match your natural tooth shade for a seamless look, as well as Glass Ionomer Cement (GIC) for specific clinical needs.",
    features: [
      "Tooth-colored Composite fillings (Aesthetic)",
      "GIC fillings for fluoride release",
      "Repairs cavities, cracks, and chips",
      "Mercury-free and safe materials"
    ]
  },
  'pediatric': {
    title: "Pediatric Dental Treatments",
    subtitle: "Dentistry for Children",
    desc: "We create a friendly and fear-free environment for children. Our pediatric services focus on preventive care, including fluoride treatments, sealants, space maintainers, and gentle treatment of cavities in baby teeth to ensure a lifetime of healthy smiles.",
    features: [
      "Gentle checkups and cleaning",
      "Fluoride application for cavity prevention",
      "Pit and Fissure Sealants",
      "Habit breaking appliances (Thumb sucking)"
    ]
  },
  'implant-bridge': {
    title: "Implant, Crown & Bridges",
    subtitle: "Fixed Prosthodontics",
    desc: "For a permanent solution to missing or damaged teeth. Dental Implants replace the root, while Crowns (caps) restore damaged teeth. Bridges use adjacent teeth to support a replacement tooth. We use Zirconia and Ceramic for durable, natural-looking results.",
    features: [
      "Dental Implants for permanent replacement",
      "Zirconia and Porcelain Crowns",
      "Fixed Bridges to close gaps",
      "Restores full chewing power"
    ]
  },
  'cosmetic': {
    title: "Cosmetic Dental Treatment",
    subtitle: "Smile Makeovers",
    desc: "Enhance the beauty of your smile with our cosmetic solutions. From professional teeth whitening to correct discoloration, to dental veneers that fix gaps and shapes, we design the smile you have always wanted.",
    features: [
      "Professional Teeth Whitening",
      "Porcelain Veneers and Laminates",
      "Diastema Closure (Closing gaps)",
      "Smile Design and contouring"
    ]
  }
};

const ServiceDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Default to 'extraction' if ID not found, or handle 404
  const service = serviceData[id] || serviceData['extraction']; 

  return (
    <div className="bg-slate-50 min-h-screen font-sans text-slate-800 flex flex-col">
      <PublicHeader />

      {/* Hero Section */}
      <section className="bg-primary-dark pt-32 pb-20 px-4 mt-16 md:mt-0 text-center text-white flex-shrink-0">
        <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <p className="text-accent font-bold tracking-widest text-sm mb-4 uppercase">
                OUR SERVICES
              </p>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-poppins font-bold mb-4">
                {service.title}
              </h1>
              <p className="text-xl md:text-2xl text-primary-light font-light max-w-2xl mx-auto">
                {service.subtitle}
              </p>
            </motion.div>
        </div>
      </section>

      {/* Content Section */}
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 -mt-10 relative z-10 w-full flex-grow">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white p-8 md:p-12 rounded-3xl shadow-xl border border-slate-100"
        >
          <div className="flex flex-col items-center">
            <h2 className="text-3xl font-poppins font-bold text-primary-dark mb-6 text-center">
                Overview
            </h2>
            <p className="text-lg text-slate-600 leading-relaxed text-center sm:text-justify max-w-3xl mb-12">
                {service.desc}
            </p>

            <div className="w-full max-w-2xl bg-slate-50 rounded-2xl p-8 border border-slate-100 mb-10">
                <h3 className="text-xl font-bold text-slate-800 mb-6 text-center">
                  Key Benefits &amp; Features:
                </h3>
                <ul className="space-y-4">
                    {service.features.map((feature, i) => (
                        <li key={i} className="flex items-start">
                            <CheckCircle className="text-accent flex-shrink-0 mr-3 mt-1" fontSize="small" />
                            <span className="text-slate-700">{feature}</span>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center w-full">
                <button 
                  onClick={() => navigate('/login')} 
                  className="bg-primary hover:bg-primary-dark text-white px-8 py-3.5 rounded-full font-semibold shadow-md shadow-primary/20 transition-all duration-300 w-full sm:w-auto transform hover:-translate-y-0.5"
                >
                    Book Appointment
                </button>
                <button 
                  onClick={() => navigate('/#services')} 
                  className="bg-white border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-600 px-8 py-3.5 rounded-full font-semibold transition-all duration-300 flex items-center justify-center w-full sm:w-auto"
                >
                    <ArrowBack className="mr-2" fontSize="small" />
                    Back to Services
                </button>
            </div>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default ServiceDetailPage;