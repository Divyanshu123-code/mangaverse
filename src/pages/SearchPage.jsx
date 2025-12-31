// src/pages/SearchResultsPage.jsx
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchManga } from "../Api/mangaApi"; // ✅ use generic fetchManga, not fetchMangaList
import Select from "react-select";

const genreOptions = [
  { value: "391b0423-d847-456f-aff0-8b0cfc03066b", label: "Action" },
  { value: "87cc87cd-a395-47af-b27a-93258283bbc6", label: "Romance" },
  { value: "4d32cc48-9f00-4cca-9b5a-a839f0764984", label: "Comedy" },
  { value: "cdc58593-87dd-415e-bbc0-2ec27bf404cc", label: "Drama" },
  { value: "f4122d1c-3b44-44d2-adc6-4d2e5e60f05d", label: "Fantasy" },
  { value: "aafb99c1-7f60-43fa-b75f-fc9502ce29c7", label: "Horror" },
  { value: "e5301a23-ebd9-49dd-a0cb-2add944c7fe9", label: "Slice of Life" },
];

const demographicOptions = [
  { value: "shounen", label: "Shounen (Boys)" },
  { value: "shoujo", label: "Shoujo (Girls)" },
  { value: "seinen", label: "Seinen (Young Men)" },
  { value: "josei", label: "Josei (Young Women)" },
];

export default function SearchPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [filters, setFilters] = useState(location.state || {});
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // ✅ Fetch results whenever filters update
  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const params = {};

        // Map filters to MangaDex API parameters
        if (filters.title) params.title = filters.title;
        if (filters.status) params["status[]"] = filters.status;
        if (filters.type) {
          if (filters.type === "manga") params["originalLanguage[]"] = "ja";
          if (filters.type === "manhwa") params["originalLanguage[]"] = "ko";
          if (filters.type === "manhua") params["originalLanguage[]"] = "zh";
        }
        if (filters.genres?.length) {
          params["includedTags[]"] = filters.genres;
        }
        if (filters.demographic)
          params["publicationDemographic[]"] = filters.demographic;

        // ✅ Call correct API function
        const data = await fetchManga(params);
        setResults(data);
      } catch (err) {
        console.error("Error fetching search results:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [filters]);

  const handleInput = (field, value) =>
    setFilters((prev) => ({ ...prev, [field]: value }));

  const handleSearch = () => {
    setFilters({ ...filters }); // Trigger refresh
  };

  const clearFilters = () => {
    setFilters({});
    navigate("/search", { state: {} });
  };

  return (
    <div className="min-h-screen bg-[#0b1220] text-white p-6 flex flex-col md:flex-row gap-6">
      {/* Sidebar Filters */}
      <div className="w-full md:w-1/4 bg-[#111827] p-6 rounded-lg h-fit">
        <h2 className="text-lg font-bold mb-4">Filters</h2>

        <input
          type="text"
          placeholder="Search by title..."
          value={filters.title || ""}
          onChange={(e) => handleInput("title", e.target.value)}
          className="w-full mb-4 p-3 rounded-lg bg-gray-800 text-white focus:outline-none"
        />

        <select
          value={filters.type || ""}
          onChange={(e) => handleInput("type", e.target.value)}
          className="w-full mb-4 p-3 rounded-lg bg-gray-800 text-white"
        >
          <option value="">All Types</option>
          <option value="manga">Manga (Japanese)</option>
          <option value="manhwa">Manhwa (Korean)</option>
          <option value="manhua">Manhua (Chinese)</option>
        </select>

        <select
          value={filters.status || ""}
          onChange={(e) => handleInput("status", e.target.value)}
          className="w-full mb-4 p-3 rounded-lg bg-gray-800 text-white"
        >
          <option value="">Any Status</option>
          <option value="ongoing">Ongoing</option>
          <option value="completed">Completed</option>
          <option value="hiatus">Hiatus</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <Select
          options={genreOptions}
          isMulti
          value={genreOptions.filter((g) =>
            (filters.genres || []).includes(g.value)
          )}
          onChange={(selected) =>
            handleInput("genres", selected ? selected.map((s) => s.value) : [])
          }
          placeholder="Select genres..."
          className="mb-4 text-black"
        />

        <Select
          options={demographicOptions}
          value={demographicOptions.find(
            (d) => d.value === filters.demographic
          )}
          onChange={(opt) => handleInput("demographic", opt?.value || "")}
          placeholder="Select demographic..."
          className="mb-4 text-black"
        />

        <div className="flex flex-col gap-3">
          <button
            onClick={handleSearch}
            className="w-full px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-500"
          >
            Apply Filters
          </button>
          <button
            onClick={clearFilters}
            className="w-full px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Results */}
      <div className="flex-1">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Search Results</h1>
          <button
            onClick={() => navigate("/home")}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500"
          >
            Close
          </button>
        </div>

        {loading ? (
          <p className="text-gray-400 text-center">Loading results...</p>
        ) : results.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {results.map((manga) => (
              <div
                key={manga.id}
                className="bg-gray-900 p-2 rounded-lg hover:scale-105 transition"
              >
                <img
                  src={manga.cover}
                  alt={manga.title}
                  className="rounded-md mb-2"
                />
                <h3 className="text-sm font-medium truncate">{manga.title}</h3>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400">No results found.</p>
        )}
      </div>
    </div>
  );
}