import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, CalendarCheck, MessageCircle, Clock, ShieldCheck, Users, Zap } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Navigation */}
      <header className="w-full bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-[1200px] mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center">
              <CalendarCheck className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-slate-900">GiliTour</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login">
              <Button variant="ghost" className="text-slate-600 hover:text-slate-900">
                Log in
              </Button>
            </Link>
            <Link to="/login">
              <Button className="bg-teal-500 hover:bg-teal-600 text-white">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        {/* Hero Section with Background Image */}
        <section className="relative w-full min-h-[80vh] flex items-center justify-center px-4 py-20">
          {/* Background Image & Overlay */}
          <div className="absolute inset-0 z-0">
            <img 
              src="https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=2070&auto=format&fit=crop" 
              alt="Tourist snorkeling in crystal clear waters in Gili" 
              className="w-full h-full object-cover"
            />
            {/* Dark gradient overlay to ensure text readability */}
            <div className="absolute inset-0 bg-slate-900/60 bg-gradient-to-t from-slate-900/80 to-transparent"></div>
          </div>

          {/* Hero Content */}
          <div className="relative z-10 max-w-[800px] mx-auto text-center space-y-8 mt-10">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-tight drop-shadow-lg">
              Manage Your <span className="text-teal-400">Lombok & Gili Tours</span> with Ease
            </h1>
            
            <p className="text-lg md:text-xl text-slate-200 max-w-[650px] mx-auto leading-relaxed drop-shadow-md">
              Reduce customer anxiety before tours. Automate reminders, manage bookings, and communicate instantly via WhatsApp. Designed specifically for Gili Islands operators.
            </p>
            
            <div className="flex flex-col items-center justify-center gap-3 pt-6">
              <Link to="/login" className="w-full sm:w-auto">
                <Button size="lg" className="bg-teal-500 hover:bg-teal-400 text-white w-full sm:w-auto text-base h-14 px-8 shadow-lg transition-all hover:scale-105">
                  Start Managing Tours
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <p className="text-sm text-slate-300 drop-shadow-md">No credit card required.</p>
            </div>

            {/* Mockup Floating Element */}
            <div className="hidden md:flex items-center justify-center mt-12 animate-fade-in-up">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl shadow-2xl flex items-center gap-4 max-w-md text-left">
                <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 border border-green-500/30">
                  <MessageCircle className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Automated WhatsApp Sent</p>
                  <p className="text-xs text-slate-200 mt-1">"Hi John, your snorkeling tour starts in 3 hours at Gili Trawangan Harbor. Here is the map link..."</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Core Features / Important Info */}
        <section className="w-full px-4 py-20 bg-slate-50">
          <div className="max-w-[1200px] mx-auto">
            <div className="text-center max-w-[800px] mx-auto mb-16">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Why Choose GiliTour?</h2>
              <p className="text-slate-600 text-lg">Everything you need to run a smooth operation and keep your customers happy and informed.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center mb-6">
                  <Clock className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Automated Reminders</h3>
                <p className="text-slate-600 leading-relaxed">
                  Never deal with no-shows again. The system automatically sends reminders H-1 day and H-3 hours before the tour starts.
                </p>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-xl bg-teal-100 flex items-center justify-center mb-6">
                  <CalendarCheck className="w-6 h-6 text-teal-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Easy Booking Management</h3>
                <p className="text-slate-600 leading-relaxed">
                  Import your bookings via CSV or let our system parse your emails automatically. Keep all your customer data in one secure place.
                </p>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center mb-6">
                  <MessageCircle className="w-6 h-6 text-amber-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Instant Communication</h3>
                <p className="text-slate-600 leading-relaxed">
                  Connect with your customers instantly. Provide clear meeting points and answer questions via built-in Chat or WhatsApp integration.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="w-full px-4 py-20 bg-white border-t border-slate-100">
          <div className="max-w-[1200px] mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="order-2 lg:order-1 grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                  <ShieldCheck className="w-8 h-8 text-teal-500 mb-4" />
                  <h4 className="font-bold text-slate-900 mb-2">Reduce Anxiety</h4>
                  <p className="text-sm text-slate-600">Give tourists peace of mind with clear, timely information about their trip.</p>
                </div>
                <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 sm:translate-y-8">
                  <Users className="w-8 h-8 text-blue-500 mb-4" />
                  <h4 className="font-bold text-slate-900 mb-2">Role-Based Access</h4>
                  <p className="text-sm text-slate-600">Secure system with distinct Admin and Operator roles for your team.</p>
                </div>
                <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                  <Zap className="w-8 h-8 text-amber-500 mb-4" />
                  <h4 className="font-bold text-slate-900 mb-2">Save Time</h4>
                  <p className="text-sm text-slate-600">Stop sending manual messages. Let the system handle the repetitive tasks.</p>
                </div>
              </div>
              
              <div className="order-1 lg:order-2 space-y-6">
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
                  Built for the unique needs of Gili travel operators
                </h2>
                <p className="text-lg text-slate-600 leading-relaxed">
                  We understand that managing tourists from all over the world requires clear communication. Language barriers and confusion about meeting points can ruin a trip before it even starts.
                </p>
                <p className="text-lg text-slate-600 leading-relaxed">
                  GiliTour bridges that gap by ensuring every customer knows exactly where to be and when, automatically.
                </p>
                <ul className="space-y-3 pt-4">
                  <li className="flex items-center text-slate-700">
                    <div className="w-6 h-6 rounded-full bg-teal-100 flex items-center justify-center mr-3">
                      <span className="text-teal-600 text-xs font-bold">✓</span>
                    </div>
                    Clear meeting point instructions
                  </li>
                  <li className="flex items-center text-slate-700">
                    <div className="w-6 h-6 rounded-full bg-teal-100 flex items-center justify-center mr-3">
                      <span className="text-teal-600 text-xs font-bold">✓</span>
                    </div>
                    Global tourist friendly (Non-technical)
                  </li>
                  <li className="flex items-center text-slate-700">
                    <div className="w-6 h-6 rounded-full bg-teal-100 flex items-center justify-center mr-3">
                      <span className="text-teal-600 text-xs font-bold">✓</span>
                    </div>
                    Accessible admin dashboard
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      {/* Footer */}
      <footer className="bg-slate-900 py-12 px-4 text-center">
        <div className="flex items-center justify-center gap-2 mb-6">
          <CalendarCheck className="w-6 h-6 text-teal-400" />
          <span className="font-bold text-xl text-white">GiliTour</span>
        </div>
        <p className="text-slate-400 max-w-[500px] mx-auto mb-8">
          The complete tour reminder & customer communication system for operators in the Gili Islands.
        </p>
        <p className="text-slate-500 text-sm">
          © {new Date().getFullYear()} GiliTour. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
