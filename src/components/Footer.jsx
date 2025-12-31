import React from "react";
import { FaGithub, FaTwitter, FaDiscord, FaInstagram } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-[#0b1220] border-t border-white/10 text-gray-400 py-8 mt-12">
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
        {/* 🔹 Logo + tagline */}
        <div className="text-center md:text-left">
          <h1 className="text-2xl font-bold text-pink-500">MangaVerse</h1>
          <p className="text-sm text-gray-500 mt-1">
            Dive into the world of Manga, Manhwa, and Manhua.
          </p>
        </div>

        {/* 🔹 Quick links */}
        <div className="flex flex-wrap justify-center md:justify-end gap-6 text-sm font-medium">
          <a href="#" className="hover:text-pink-400 transition">
            About
          </a>
          <a href="#" className="hover:text-pink-400 transition">
            Contact
          </a>
          <a href="#" className="hover:text-pink-400 transition">
            Terms of Use
          </a>
          <a href="#" className="hover:text-pink-400 transition">
            Privacy Policy
          </a>
        </div>
      </div>

      {/* 🔹 Divider */}
      <div className="border-t border-white/10 my-6 mx-auto w-11/12"></div>

      {/* 🔹 Bottom Row */}
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
        <p>
          © {new Date().getFullYear()} <span className="text-pink-400">MangaVerse</span>. All rights reserved.
        </p>

        <div className="flex gap-5 mt-3 md:mt-0 text-lg">
          <a
            href="https://github.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-pink-500 transition"
          >
            <FaGithub />
          </a>
          <a
            href="https://twitter.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-pink-500 transition"
          >
            <FaTwitter />
          </a>
          <a
            href="https://discord.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-pink-500 transition"
          >
            <FaDiscord />
          </a>
          <a
            href="https://instagram.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-pink-500 transition"
          >
            <FaInstagram />
          </a>
        </div>
      </div>
    </footer>
  );
}