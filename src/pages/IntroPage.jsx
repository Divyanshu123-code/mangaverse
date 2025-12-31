// src/pages/IntroPage.jsx
import { Link } from "react-router-dom";

export default function IntroPage() {
  return (
    <div className="relative h-screen w-screen flex items-center justify-between overflow-hidden bg-[#0f0f1a]">
      {/* subtle background glow */}
      <div className="absolute inset-0 pointer-events-none">
      <div className="absolute left-[-20%] top-1/2 -translate-y-1/2 w-[700px] h-[700px]
    bg-[radial-gradient(circle,rgba(59,130,246,0.18),transparent_60%)]">
     </div>
     </div>
     <div className="absolute left-0 top-0 h-full w-[45%] 
        bg-gradient-to-r from-black/40 via-black/20 to-transparent pointer-events-none" />
      {/* Left Section */}
      <div className="relative z-10 flex-1 px-16 animate-fadeInUp">
        <h1 className="text-6xl font-extrabold mb-6 tracking-tight">
          <span className="bg-gradient-to-r from-pink-500 to-red-500 bg-clip-text text-transparent">
            MangaVerse
          </span>
        </h1>

        <h2 className="text-2xl text-gray-300 mb-4">
          Read. Create. <span className="text-white font-semibold">Connect.</span>
        </h2>

        <p className="text-lg text-gray-400 mb-10 max-w-xl">
          Join <span className="font-bold text-white">10,000+</span> readers and creators awaiting your story
        </p>

        <Link
          to="/login"
          className="px-9 py-3 rounded-full font-semibold text-white
          bg-gradient-to-r from-pink-500 via-red-500 to-red-600
          hover:scale-105 hover:shadow-[0_0_40px_rgba(239,68,68,0.45)]
          transition-all duration-300"
        >
          Get Started
        </Link>
      </div>

      {/* Right Section (images) */}
      <div className="relative flex-1 h-[85%] flex justify-end rounded-2xl overflow-hidden shadow-2xl">
        <div className="relative h-full w-full flex">
          {["/images/img1.jpg", "/images/img2.jpg", "/images/img3.jpg", "/images/img4.jpg"].map(
            (src, index) => (
              <div key={index} className="relative flex-1 h-full overflow-hidden">
                <img
                  src={src}
                  alt="Manga Banner"
                  className="h-full w-full object-cover scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent" />
              </div>
            )
          )}
        </div>

        {/* left fade for smooth transition */}
        <div className="absolute inset-y-0 left-0 w-40 bg-gradient-to-r from-[#0f0f1a] via-[#0f0f1a]/90 to-transparent pointer-events-none" />
      </div>
    </div>
  );
}