// src/components/SearchModel.jsx
import React, { useState, useEffect } from "react";
import Select from "react-select";
import { useNavigate } from "react-router-dom";

/** Full genre list (user-provided). Values are the human-friendly names;
 * API will slugify these to keywords for MangaDex. */
const genreOptions = [
  { value: "Action / Adventure", label: "Action / Adventure" },
  { value: "Adult", label: "Adult" },
  { value: "Adventure", label: "Adventure" },
  { value: "Bisexual", label: "Bisexual" },
  { value: "Comedy", label: "Comedy" },
  { value: "Comics adaptations", label: "Comics adaptations" },
  { value: "Coming-of-age", label: "Coming-of-age" },
  { value: "Detective / Mystery", label: "Detective / Mystery" },
  { value: "Dōjinshi (Self-published)", label: "Dōjinshi (Self-published)" },
  { value: "Drama", label: "Drama" },
  { value: "Ecchi / Erotic", label: "Ecchi / Erotic" },
  { value: "Fantasy (includes Isekai)", label: "Fantasy (includes Isekai)" },
  { value: "Gender Bender", label: "Gender Bender" },
  { value: "Graphic Novels", label: "Graphic Novels" },
  { value: "Harem", label: "Harem" },
  { value: "Historical / Historical Fiction / Alternative Histories", label: "Historical / Historical Fiction / Alternative Histories" },
  { value: "Horror", label: "Horror" },
  { value: "How-to / Gakushu", label: "How-to / Gakushu" },
  { value: "Humorous", label: "Humorous" },
  { value: "Legal", label: "Legal" },
  { value: "Medical", label: "Medical" },
  { value: "Magical / Magical Girl", label: "Magical / Magical Girl" },
  { value: "Martial Arts", label: "Martial Arts" },
  { value: "Mecha (Machines and Robots)", label: "Mecha (Machines and Robots)" },
  { value: "Monster / Kaiju", label: "Monster / Kaiju" },
  { value: "Nonfiction", label: "Nonfiction" },
  { value: "Paranormal", label: "Paranormal" },
  { value: "Parody", label: "Parody" },
  { value: "Pornographic", label: "Pornographic" },
  { value: "Psychological", label: "Psychological" },
  { value: "Queer", label: "Queer" },
  { value: "Religious", label: "Religious" },
  { value: "Romance", label: "Romance" },
  { value: "Romantic Comedy", label: "Romantic Comedy" },
  { value: "Samurai", label: "Samurai" },
  { value: "School", label: "School" },
  { value: "Science Fiction (includes Cyberpunk)", label: "Science Fiction (includes Cyberpunk)" },
  { value: "Shōjo-ai (Girls’ Love)", label: "Shōjo-ai (Girls’ Love)" },
  { value: "Shōnen-ai (Boys’ Love, or BL)", label: "Shōnen-ai (Boys’ Love, or BL)" },
  { value: "Slice of Life", label: "Slice of Life" },
  { value: "Social issue", label: "Social issue" },
  { value: "Sports", label: "Sports" },
  { value: "Spy", label: "Spy" },
  { value: "Superhero", label: "Superhero" },
  { value: "Supernatural", label: "Supernatural" },
  { value: "Thriller", label: "Thriller" },
  { value: "Tragedy", label: "Tragedy" },
  { value: "Transgender", label: "Transgender" },
  { value: "Underground", label: "Underground" },
  { value: "War", label: "War" },
  { value: "Wordless", label: "Wordless" },
  { value: "Yaoi", label: "Yaoi" },
  { value: "Yuri", label: "Yuri" }
];

const demographicOptions = [
  { value: "shounen", label: "Shonen" },
  { value: "shoujo", label: "Shoujo" },
  { value: "seinen", label: "Seinen" },
  { value: "josei", label: "Josei" },
  { value: "none", label: "None" }
];

export default function SearchModel({ isOpen = true, onClose = () => {} }) {
  const [title, setTitle] = useState("");
  const [type, setType] = useState("");
  const [status, setStatus] = useState("");
  const [genres, setGenres] = useState([]);
  const [demographic, setDemographic] = useState("");
  const [author, setAuthor] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!isOpen) {
      // reset inputs optionally
      // setTitle(""); setGenres([]); ...
    }
  }, [isOpen]);

  const handleSearch = () => {
    const query = {
      title: title?.trim() || "",
      type,
      status,
      // send array of human-friendly genre names (mangadex API layer will slugify)
      genres: genres.map((g) => g.value),
      demographic,
      author: author?.trim() || ""
    };

    // go to /search page with state (works even when popup used)
    navigate("/search", { state: query });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/75 flex items-start md:items-center justify-center z-50 p-4">
      <div className="bg-[#0b1220] border border-white/10 rounded-xl w-full max-w-3xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Search & Filters</h2>
          <button onClick={onClose} className="text-white/70 hover:text-white">Close ✕</button>
        </div>

        <input
          type="text"
          placeholder="Title (or leave blank to apply only filters)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full mb-3 p-3 rounded bg-gray-800 text-white"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input
            type="text"
            placeholder="Author (optional)"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            className="w-full p-3 rounded bg-gray-800 text-white"
          />

          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full p-3 rounded bg-gray-800 text-white"
          >
            <option value="">All types</option>
            <option value="manga">Manga (Japanese)</option>
            <option value="manhwa">Manhwa (Korean)</option>
            <option value="manhua">Manhua (Chinese)</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full p-3 rounded bg-gray-800 text-white"
          >
            <option value="">Any status</option>
            <option value="ongoing">Ongoing</option>
            <option value="completed">Completed</option>
            <option value="hiatus">Hiatus</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <Select
            options={demographicOptions}
            value={demographicOptions.find((d) => d.value === demographic) || null}
            onChange={(opt) => setDemographic(opt?.value || "")}
            placeholder="Demographic (shounen, seinen...)"
            className="text-black"
          />
        </div>

        <div className="mt-3">
          <Select
            options={genreOptions}
            isMulti
            value={genres}
            onChange={(selected) => setGenres(selected || [])}
            placeholder="Select genres (multiple)..."
            className="text-black"
          />
        </div>

        <div className="flex justify-end gap-3 mt-5">
          <button onClick={onClose} className="px-4 py-2 bg-gray-600 rounded text-white">Cancel</button>
          <button onClick={handleSearch} className="px-5 py-2 bg-pink-600 rounded text-white">Search</button>
        </div>
      </div>
    </div>
  );
}