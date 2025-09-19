import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Zap, Code, Palette, Database, Rocket, ArrowRight, Sparkles, Users, Github, Linkedin, Twitter } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  // Redirect authenticated users to projects
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/projects', { replace: true });
    }
  }, [isAuthenticated, navigate]);
  const features = [
    {
      icon: Palette,
      title: 'Visual Design Canvas',
      description: 'Drag and drop components to build beautiful interfaces without coding'
    },
    {
      icon: Sparkles,
      title: 'AI Code Generation',
      description: 'AI automatically generates clean, production-ready code from your designs'
    },
    {
      icon: Database,
      title: 'Backend Builder',
      description: 'Create APIs, database models, and authentication with visual tools'
    },
    {
      icon: Rocket,
      title: 'One-Click Deploy',
      description: 'Deploy your full-stack application to the cloud instantly'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-50 to-secondary-50 py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-primary-600 p-4 rounded-2xl">
                <Zap className="w-12 h-12 text-white" />
              </div>
            </div>
            
            <h1 className="text-5xl font-bold text-gray-900 mb-6 text-balance">
              Build Full-Stack Apps with{' '}
              <span className="text-primary-600">AI Power</span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto text-balance">
              The no-code platform that combines visual design, AI-driven code generation, 
              and backend development to help non-technical founders build and deploy 
              complete web applications.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/builder" 
                className="btn-primary text-lg px-8 py-4 flex items-center space-x-2"
              >
                <Code className="w-5 h-5" />
                <span>Start Building</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              
              <Link 
                to="/projects" 
                className="btn-outline text-lg px-8 py-4 flex items-center space-x-2"
              >
                <span>View Examples</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Everything You Need to Build & Deploy
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              From design to deployment, our platform provides all the tools you need 
              to bring your ideas to life without writing a single line of code.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="card p-6 text-center hover:shadow-lg transition-shadow">
                <div className="bg-primary-100 w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-gray-600">
              Build your dream application in three simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Design Your Interface
              </h3>
              <p className="text-gray-600">
                Use our intuitive drag-and-drop canvas to design beautiful user interfaces 
                with pre-built components.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Build Your Backend
              </h3>
              <p className="text-gray-600">
                Define your data models and APIs using our visual backend builder. 
                AI generates the code automatically.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Deploy & Launch
              </h3>
              <p className="text-gray-600">
                Deploy your full-stack application to the cloud with one click. 
                Your app is live and ready for users.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section - Built by Deep Hackers */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <div className="flex justify-center mb-6">
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-3 rounded-xl">
                <Users className="w-8 h-8 text-white" />
              </div>
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Built by <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">Deep Hackers</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Meet the passionate team of developers, designers, and innovators who are revolutionizing 
              how applications are built and deployed.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8">
            {/* Team Member 1 - Chevvuri Karthik */}
            <div className="group">
              <div className="card p-6 text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                <div className="relative mb-6">
                  <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold">
                    CK
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-green-500 w-6 h-6 rounded-full border-4 border-white"></div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Chevvuri Karthik
                </h3>
                <p className="text-primary-600 font-medium mb-3 text-sm">
                  Lead Full-Stack Developer
                </p>
                <p className="text-gray-600 text-xs mb-4">
                  AI & React specialist building scalable web platforms
                </p>
                <div className="flex justify-center space-x-3">
                  <button className="text-gray-400 hover:text-blue-600 transition-colors">
                    <Github className="w-4 h-4" />
                  </button>
                  <button className="text-gray-400 hover:text-blue-600 transition-colors">
                    <Linkedin className="w-4 h-4" />
                  </button>
                  <button className="text-gray-400 hover:text-blue-600 transition-colors">
                    <Twitter className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Team Member 2 - Mani Kumar */}
            <div className="group">
              <div className="card p-6 text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                <div className="relative mb-6">
                  <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-r from-pink-500 to-red-600 flex items-center justify-center text-white text-xl font-bold">
                    MK
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-green-500 w-6 h-6 rounded-full border-4 border-white"></div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Mani Kumar
                </h3>
                <p className="text-primary-600 font-medium mb-3 text-sm">
                  Frontend Developer
                </p>
                <p className="text-gray-600 text-xs mb-4">
                  UI/UX specialist creating intuitive user experiences
                </p>
                <div className="flex justify-center space-x-3">
                  <button className="text-gray-400 hover:text-pink-600 transition-colors">
                    <Github className="w-4 h-4" />
                  </button>
                  <button className="text-gray-400 hover:text-pink-600 transition-colors">
                    <Linkedin className="w-4 h-4" />
                  </button>
                  <button className="text-gray-400 hover:text-pink-600 transition-colors">
                    <Twitter className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Team Member 3 - Chevvuri Kishore */}
            <div className="group">
              <div className="card p-6 text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                <div className="relative mb-6">
                  <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-r from-green-500 to-teal-600 flex items-center justify-center text-white text-xl font-bold">
                    CK
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-green-500 w-6 h-6 rounded-full border-4 border-white"></div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Chevvuri Kishore
                </h3>
                <p className="text-primary-600 font-medium mb-3 text-sm">
                  Backend Developer
                </p>
                <p className="text-gray-600 text-xs mb-4">
                  Infrastructure expert specializing in scalable APIs
                </p>
                <div className="flex justify-center space-x-3">
                  <button className="text-gray-400 hover:text-green-600 transition-colors">
                    <Github className="w-4 h-4" />
                  </button>
                  <button className="text-gray-400 hover:text-green-600 transition-colors">
                    <Linkedin className="w-4 h-4" />
                  </button>
                  <button className="text-gray-400 hover:text-green-600 transition-colors">
                    <Twitter className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Team Member 4 - Rahul Grandhi */}
            <div className="group">
              <div className="card p-6 text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                <div className="relative mb-6">
                  <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-r from-yellow-500 to-orange-600 flex items-center justify-center text-white text-xl font-bold">
                    RG
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-green-500 w-6 h-6 rounded-full border-4 border-white"></div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Rahul Grandhi
                </h3>
                <p className="text-primary-600 font-medium mb-3 text-sm">
                  DevOps Engineer
                </p>
                <p className="text-gray-600 text-xs mb-4">
                  Cloud deployment specialist ensuring smooth operations
                </p>
                <div className="flex justify-center space-x-3">
                  <button className="text-gray-400 hover:text-orange-600 transition-colors">
                    <Github className="w-4 h-4" />
                  </button>
                  <button className="text-gray-400 hover:text-orange-600 transition-colors">
                    <Linkedin className="w-4 h-4" />
                  </button>
                  <button className="text-gray-400 hover:text-orange-600 transition-colors">
                    <Twitter className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Team Member 5 - Sree Vaishnavi Alugunuri */}
            <div className="group">
              <div className="card p-6 text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                <div className="relative mb-6">
                  <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 flex items-center justify-center text-white text-xl font-bold">
                    SV
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-green-500 w-6 h-6 rounded-full border-4 border-white"></div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Sree Vaishnavi Alugunuri
                </h3>
                <p className="text-primary-600 font-medium mb-3 text-sm">
                  AI Engineer & Data Scientist
                </p>
                <p className="text-gray-600 text-xs mb-4">
                  Machine learning expert powering intelligent code generation
                </p>
                <div className="flex justify-center space-x-3">
                  <button className="text-gray-400 hover:text-purple-600 transition-colors">
                    <Github className="w-4 h-4" />
                  </button>
                  <button className="text-gray-400 hover:text-purple-600 transition-colors">
                    <Linkedin className="w-4 h-4" />
                  </button>
                  <button className="text-gray-400 hover:text-purple-600 transition-colors">
                    <Twitter className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Team Stats */}
          <div className="mt-16 grid md:grid-cols-4 gap-8 text-center">
            <div className="p-6">
              <div className="text-3xl font-bold text-primary-600 mb-2">15+</div>
              <div className="text-gray-600">Years Combined Experience</div>
            </div>
            <div className="p-6">
              <div className="text-3xl font-bold text-primary-600 mb-2">100+</div>
              <div className="text-gray-600">Projects Completed</div>
            </div>
            <div className="p-6">
              <div className="text-3xl font-bold text-primary-600 mb-2">5</div>
              <div className="text-gray-600">Deep Hackers Team Members</div>
            </div>
            <div className="p-6">
              <div className="text-3xl font-bold text-primary-600 mb-2">24/7</div>
              <div className="text-gray-600">Passion for Innovation</div>
            </div>
          </div>

          {/* Team Mission */}
          <div className="mt-16 text-center">
            <div className="max-w-3xl mx-auto">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h3>
              <p className="text-lg text-gray-600 leading-relaxed">
                We believe that everyone should have the power to build their digital dreams, 
                regardless of technical background. Our team is dedicated to democratizing 
                software development through innovative AI-powered tools and intuitive design.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Build Your Next Big Idea?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Join thousands of founders who are building amazing applications 
            without technical expertise.
          </p>
          
          <Link 
            to="/builder" 
            className="bg-white text-primary-600 hover:bg-gray-100 px-8 py-4 rounded-lg font-semibold text-lg inline-flex items-center space-x-2 transition-colors"
          >
            <span>Get Started for Free</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
