import { useEffect, useState } from "react";
import {
  Package,
  Boxes,
  Archive,
  Trash2,
  Edit,
  Search,
  ScanLine,
  RefreshCw,
  X,
  Save,
  ChevronRight,
} from "lucide-react";

const API_URL = "http://localhost:5000";

export default function AdminInventory() {
  const [inventory, setInventory] = useState([]);
  const [summary, setSummary] = useState({
    available: 0,
    reserved: 0,
    consumed: 0,
    cards: 0,
  });

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const [editingCard, setEditingCard] = useState(null);
  const [quantity, setQuantity] = useState("");

  const [scanFiles, setScanFiles] = useState([]);
  const [scanning, setScanning] = useState(false);

  // =====================================================
// INVENTORY CATEGORIES
// =====================================================

const DEFAULT_CATEGORIES = [
  { name: "B1 Base", min: 1, max: 3 },
  { name: "B2 Bronze", min: 3, max: 8 },
  { name: "B3 Silver", min: 8, max: 20 },
  { name: "B4 Gold", min: 20, max: 50 },
  { name: "B5 Platinum", min: 50, max: 125 },
  { name: "B6 Diamond", min: 125, max: 350 },
  { name: "B7 Master", min: 350, max: 900 },
  { name: "B8 Grail", min: 900, max: 2500 },
];

const [showCategories, setShowCategories] = useState(false);
const [selectedCategory, setSelectedCategory] = useState(null);
const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
const [categorySaving, setCategorySaving] = useState(false);

// CREATE CATEGORY
const [showCreateCategory, setShowCreateCategory] = useState(false);
const [creatingCategory, setCreatingCategory] = useState(false);
const [newCategory, setNewCategory] = useState({
  name: "",
  description: "",
  minPrice: "",
  maxPrice: "",
  status: "ACTIVE",
  sortOrder: "",
});

const getCategoryRange = (category) => {
  const min = Number(category.min ?? category.minPrice ?? 0);
  const max = Number(category.max ?? category.maxPrice ?? 0);
  return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
};

const getCardsForCategory = (category) => {
  // INACTIVE categories are not shown/used on Inventory.
  if (category.status === "INACTIVE") return [];

  const min = Number(category.min ?? category.minPrice);
  const max = Number(category.max ?? category.maxPrice);

  return inventory.filter((item) => {
    const price = Number(item.card?.price);
    if (!Number.isFinite(price)) return false;

    if (category.name === "B8 Grail") {
      return price >= min && price <= max;
    }

    return price >= min && price < max;
  });
};

// TOKEN
  // =====================================================

 const getToken = () => {
  return localStorage.getItem("adminToken");
};

  // =====================================================
  // FETCH SUMMARY
  // =====================================================

  const fetchSummary = async () => {
    try {
      const token = getToken();

      const response = await fetch(
        `${API_URL}/api/admin/inventory/summary`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Unable to load summary"
        );
      }

      setSummary(
        result.data || {
          available: 0,
          reserved: 0,
          consumed: 0,
          cards: 0,
        }
      );
    } catch (error) {
      console.error(
        "Inventory summary error:",
        error
      );
    }
  };

  // =====================================================
  // FETCH INVENTORY
  // =====================================================

  const fetchInventory = async () => {
    try {
      setLoading(true);

      const token = getToken();

      const response = await fetch(
        `${API_URL}/api/admin/inventory?search=${encodeURIComponent(
          search
        )}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Unable to load inventory"
        );
      }

      setInventory(
        result.data?.inventory || []
      );
    } catch (error) {
      console.error(
        "Inventory error:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // FETCH CATEGORIES
  // =====================================================

  const fetchCategories = async () => {
    try {
      const token = getToken();
      const response = await fetch(
        `${API_URL}/api/admin/pack-categories`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Unable to load categories");
      }

      const apiCategories =
        result.categories || result.data?.categories || [];

      if (apiCategories.length) {
        setCategories(
          apiCategories.map((item, index) => ({
            ...item,
            name:
              item.name ||
              DEFAULT_CATEGORIES[index]?.name ||
              `B${index + 1}`,
            min: Number(
              item.minPrice ??
                item.min ??
                DEFAULT_CATEGORIES[index]?.min ??
                0
            ),
            max: Number(
              item.maxPrice ??
                item.max ??
                DEFAULT_CATEGORIES[index]?.max ??
                0
            ),
          }))
        );
      }
    } catch (error) {
      console.error("Category error:", error);
      // Keep default categories if the category endpoint is unavailable.
    }
  };

  // =====================================================
  // SAVE CATEGORY PRICE RANGE
  // =====================================================

  const saveCategory = async (category) => {
    const min = Number(category.min);
    const max = Number(category.max);

    if (!Number.isFinite(min) || !Number.isFinite(max) || min < 0 || max < 0) {
      alert("Enter valid minimum and maximum prices.");
      return;
    }

    if (min >= max) {
      alert("Minimum price must be less than maximum price.");
      return;
    }

    if (!category._id) {
      alert("Category ID is missing. Add the category update API before saving.");
      return;
    }

    try {
      setCategorySaving(true);
      const token = getToken();
      const response = await fetch(
        `${API_URL}/api/admin/pack-categories/${category._id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: category.name,
            minPrice: min,
            maxPrice: max,
            status: category.status || "ACTIVE",
          }),
        }
      );

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Unable to update category");
      }

      setCategories((current) =>
        current.map((item) =>
          item._id === category._id
            ? {
                ...item,
                min,
                max,
                minPrice: min,
                maxPrice: max,
                status: category.status || "ACTIVE",
              }
            : item
        )
      );

      setSelectedCategory((current) =>
        current?._id === category._id
          ? {
              ...current,
              min,
              max,
              minPrice: min,
              maxPrice: max,
              status: category.status || "ACTIVE",
            }
          : current
      );

      alert("Category updated successfully.");
    } catch (error) {
      console.error("Save category error:", error);
      alert(error.message);
    } finally {
      setCategorySaving(false);
    }
  };

  // =====================================================
  // DELETE CATEGORY
  // =====================================================

  const deleteCategory = async (category) => {
    if (!category?._id) {
      alert("Category ID not found.");
      return;
    }

    const confirmed = window.confirm(
      `Delete "${category.name}" category? This cannot be undone.`
    );

    if (!confirmed) return;

    try {
      setCategorySaving(true);

      const token = getToken();

      const response = await fetch(
        `${API_URL}/api/admin/pack-categories/${category._id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Unable to delete category"
        );
      }

      if (selectedCategory?._id === category._id) {
        setSelectedCategory(null);
      }

      await fetchCategories();

      alert(
        result.message ||
          "Category deleted successfully."
      );
    } catch (error) {
      console.error(
        "Delete category error:",
        error
      );
      alert(error.message);
    } finally {
      setCategorySaving(false);
    }
  };

  // =====================================================
  // CREATE CATEGORY
  // =====================================================

  const createCategory = async () => {
    const name = newCategory.name.trim();
    const min = Number(newCategory.minPrice);
    const max =
      newCategory.maxPrice === "" ||
      newCategory.maxPrice === null
        ? null
        : Number(newCategory.maxPrice);

    if (!name) {
      alert("Category name is required.");
      return;
    }

    if (!Number.isFinite(min) || min < 0) {
      alert("Enter a valid minimum price.");
      return;
    }

    if (
      max !== null &&
      (!Number.isFinite(max) || max < min)
    ) {
      alert("Maximum price must be greater than or equal to minimum price.");
      return;
    }

    try {
      setCreatingCategory(true);

      const token = getToken();

      const response = await fetch(
        `${API_URL}/api/admin/pack-categories`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name,
            description: newCategory.description.trim(),
            minPrice: min,
            maxPrice: max,
            status: newCategory.status,
            sortOrder:
              Number(newCategory.sortOrder) || 0,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Unable to create category"
        );
      }

      setShowCreateCategory(false);

      setNewCategory({
        name: "",
        description: "",
        minPrice: "",
        maxPrice: "",
        status: "ACTIVE",
        sortOrder: "",
      });

      await fetchCategories();

      alert(
        result.message ||
          "Category created successfully."
      );
    } catch (error) {
      console.error(
        "Create category error:",
        error
      );
      alert(error.message);
    } finally {
      setCreatingCategory(false);
    }
  };

  // =====================================================
  // INITIAL LOAD
  // =====================================================


  // =====================================================

  useEffect(() => {
    fetchInventory();
    fetchSummary();
    fetchCategories();
  }, []);

  // =====================================================
  // SEARCH
  // =====================================================

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchInventory();
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);

  // =====================================================
  // REFRESH
  // =====================================================

  const refreshInventory = async () => {
    await Promise.all([
      fetchInventory(),
      fetchSummary(),
      fetchCategories(),
    ]);
  };

  // =====================================================
  // UPDATE INVENTORY
  // =====================================================

  const updateQuantity = async () => {
    if (!editingCard) return;

    const newQuantity = Number(quantity);

    if (
      !Number.isInteger(newQuantity) ||
      newQuantity < 0
    ) {
      alert(
        "Quantity must be a whole number greater than or equal to 0."
      );
      return;
    }

    try {
      const token = getToken();

      const response = await fetch(
        `${API_URL}/api/admin/inventory/${editingCard.card._id}`,
        {
          method: "PUT",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            available: newQuantity,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Unable to update inventory"
        );
      }

      setEditingCard(null);
      setQuantity("");

      await refreshInventory();

    } catch (error) {
      console.error(
        "Update inventory error:",
        error
      );

      alert(error.message);
    }
  };
  // =====================================================
// REFRESH CARD PRICE
// =====================================================

const refreshCardPrice = async (cardId) => {
  try {
    const token = getToken();

    const response = await fetch(
      `${API_URL}/api/admin/inventory/${cardId}/refresh-price`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.message ||
          "Unable to refresh card price"
      );
    }

    alert(
      result.message ||
        "Card price updated successfully"
    );

    await refreshInventory();

  } catch (error) {
    console.error(
      "Refresh card price error:",
      error
    );

    alert(error.message);
  }
};

  // =====================================================
  // DELETE
  // =====================================================

  const deleteInventory = async (cardId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this inventory record?"
    );

    if (!confirmed) return;

    try {
      const token = getToken();

      const response = await fetch(
        `${API_URL}/api/admin/inventory/${cardId}`,
        {
          method: "DELETE",

          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Unable to delete inventory"
        );
      }

      await refreshInventory();

    } catch (error) {
      console.error(
        "Delete inventory error:",
        error
      );

      alert(error.message);
    }
  };

 // =====================================================
// SCAN / IMPORT CARDS
// =====================================================

const scanCard = async () => {
  if (!scanFiles.length) {
    alert("Please select a card image, folder, CSV or Excel file.");
    return;
  }

  try {
    setScanning(true);

    const token = getToken();

    // -----------------------------------------------
    // PROCESS SELECTED FILES
    // -----------------------------------------------

    for (const file of scanFiles) {

      const formData = new FormData();

      // CSV / Excel
      if (
        file.name.toLowerCase().endsWith(".csv") ||
        file.name.toLowerCase().endsWith(".xlsx") ||
        file.name.toLowerCase().endsWith(".xls")
      ) {
        formData.append("cardFile", file);
      }

      // Image
      else if (file.type.startsWith("image/")) {
        formData.append("cardImage", file);
      }

      else {
        console.warn(
          "Unsupported file:",
          file.name
        );
        continue;
      }

      const response = await fetch(
        `${API_URL}/api/admin/inventory/scan`,
        {
          method: "POST",

          headers: {
            Authorization:
              `Bearer ${token}`,
          },

          body: formData,
        }
      );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
          `Unable to process ${file.name}`
        );
      }

      console.log(
        `Processed: ${file.name}`,
        result
      );
    }

    alert(
      "All selected cards/files processed successfully."
    );

    setScanFiles([]);

    // Reset normal input
    const input =
      document.getElementById(
        "cardScanner"
      );

    if (input) {
      input.value = "";
    }

    // Reset folder input
    const folderInput =
      document.getElementById(
        "cardFolder"
      );

    if (folderInput) {
      folderInput.value = "";
    }

    await refreshInventory();

  } catch (error) {

    console.error(
      "Scan/import error:",
      error
    );

    alert(error.message);

  } finally {

    setScanning(false);
  }
};

  // =====================================================
  // HELPERS
  // =====================================================

  const getSetName = (set) => {
    if (!set) return "-";

    if (typeof set === "string") {
      return set;
    }

    return set.name || "-";
  };

  const getImage = (card) => {
  if (!card) return "";

  if (card.imageSmall) {
    return card.imageSmall.startsWith("http")
      ? card.imageSmall
      : `${API_URL}${card.imageSmall}`;
  }

  if (card.imageLarge) {
    return card.imageLarge.startsWith("http")
      ? card.imageLarge
      : `${API_URL}${card.imageLarge}`;
  }

  return "";
};

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="space-y-6">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

        <div>
          <h1 className="text-2xl font-bold">
            Inventory
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage your physical Pokémon card inventory.
          </p>
        </div>

        <div className="flex items-center gap-3">

  {/* CATEGORIES */}
  <button
  onClick={() =>
    setShowCategories(true)
  }
  className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-800 hover:bg-gray-100"
>
  <Boxes size={17} />
  Categories
</button>

  {/* REFRESH */}
  <button
    onClick={refreshInventory}
    className="flex items-center justify-center gap-2 rounded-xl bg-black px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-800"
  >
    <RefreshCw size={17} />
    Refresh
  </button>

</div>

      </div>


      {/* =================================================
          SUMMARY CARDS
      ================================================= */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <SummaryCard
          title="Card Types"
          value={summary.cards}
          icon={<Boxes size={22} />}
        />

        <SummaryCard
          title="Available"
          value={summary.available}
          icon={<Package size={22} />}
        />

        <SummaryCard
          title="Reserved"
          value={summary.reserved}
          icon={<Archive size={22} />}
        />

        <SummaryCard
          title="Consumed"
          value={summary.consumed}
          icon={<Package size={22} />}
        />

      </div>


      {/* ===================================================== */}
{/* SCAN / IMPORT CARDS */}
{/* ===================================================== */}

<div className="flex flex-col gap-3 md:flex-row md:items-center">

  <div className="flex-1">

    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">

      {/* UPLOAD BUTTONS */}
      <div className="flex flex-wrap items-center gap-3">

        {/* SINGLE / MULTIPLE FILES */}
        <label
          htmlFor="cardScanner"
          className="cursor-pointer rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold hover:bg-gray-100"
        >
          Choose Files
        </label>

        {/* FOLDER */}
        <label
          htmlFor="cardFolder"
          className="cursor-pointer rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold hover:bg-gray-100"
        >
          Choose Folder
        </label>

        {/* SELECTED FILE COUNT */}
        <span className="text-sm text-gray-500">
          {scanFiles.length > 0
            ? `${scanFiles.length} file(s) selected`
            : "No files selected"}
        </span>

      </div>


      {/* ================================================= */}
      {/* NORMAL FILE INPUT */}
      {/* ================================================= */}

      <input
        id="cardScanner"
        type="file"
        multiple
        accept="image/*,.csv,.xlsx,.xls"
        onChange={(e) => {

          const files =
            Array.from(
              e.target.files || []
            );

          setScanFiles(files);

        }}
        className="hidden"
      />


      {/* ================================================= */}
      {/* FOLDER INPUT */}
      {/* ================================================= */}

      <input
        id="cardFolder"
        type="file"
        multiple
        webkitdirectory=""
        directory=""
        accept="image/*"
        onChange={(e) => {

          const files =
            Array.from(
              e.target.files || []
            );

          setScanFiles(files);

        }}
        className="hidden"
      />


      {/* ================================================= */}
      {/* SUPPORTED FILE TYPES */}
      {/* ================================================= */}

      <p className="mt-3 text-xs text-gray-400">
        Supports: JPG, PNG, WEBP, CSV, XLS, XLSX,
        and folders containing card images.
      </p>

    </div>

  </div>


  {/* =================================================== */}
  {/* SCAN / IMPORT BUTTON */}
  {/* =================================================== */}

  <button
    onClick={scanCard}
    disabled={
      scanFiles.length === 0 ||
      scanning
    }
    className="flex min-w-[170px] items-center justify-center gap-2 rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
  >

    <ScanLine size={18} />

    {scanning
      ? "Processing..."
      : "Scan / Import Cards"}

  </button>

</div>

      {/* =================================================
          SEARCH
      ================================================= */}

      <div className="rounded-2xl bg-white p-5 shadow-sm">

        <div className="relative">

          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Search card name or TCG ID..."
            className="w-full rounded-xl border border-gray-200 py-3 pl-11 pr-4 outline-none focus:border-black"
          />

        </div>

      </div>


      {/* =================================================
          CATEGORY GRID
      ================================================= */}

      <div className="flex flex-col gap-5">
        {categories
          .filter((category) => category.status !== "INACTIVE")
          .map((category) => {
            const categoryCards = getCardsForCategory(category);

            return (
            <div
              key={category._id || category.name}
              role="button"
              tabIndex={0}
              onClick={() => setSelectedCategory(category)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setSelectedCategory(category);
                }
              }}
              className="w-full cursor-pointer rounded-xl border border-gray-200 bg-white px-6 py-5 text-left shadow-sm transition hover:border-blue-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <div className="flex items-center justify-between gap-8">
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-widest text-blue-600">
                    CATEGORY
                  </p>
                  <h3 className="mt-1 text-lg font-bold text-gray-900">
                    {category.name}
                  </h3>
                  <p className="mt-1 text-sm font-medium text-gray-500">
                    {getCategoryRange(category)}
                  </p>
                </div>

                <div className="shrink-0 text-right">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                    CARDS
                  </p>
                  <p className="mt-1 text-xl font-bold text-gray-900">
                    {categoryCards.length}
                  </p>
                </div>
              </div>
            </div>
          );
          })}
      </div>

      {/* =====================================================
          CATEGORY EDIT MODAL
      ===================================================== */}

      {showCategories && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-4xl overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b px-6 py-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-blue-600">
                  CATEGORY SETTINGS
                </p>
                <div className="flex items-center gap-3">
                  <h2 className="mt-1 text-2xl font-bold text-gray-900">
                    Edit Card Price Categories
                  </h2>

                  <button
                    type="button"
                    onClick={() => setShowCreateCategory(true)}
                    className="flex items-center gap-2 rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
                  >
                    <span className="text-lg leading-none">+</span>
                    Create
                  </button>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  Change the price range used to group inventory cards.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCategories(false)}
                className="rounded-xl bg-gray-100 p-2.5 text-gray-600 hover:bg-gray-200"
              >
                <X size={20} />
              </button>
            </div>

            <div className="max-h-[70vh] overflow-y-auto p-6">
              <div className="space-y-3">
                {categories.map((category, index) => (
                  <div
                    key={category._id || category.name}
                    className="grid grid-cols-1 gap-4 rounded-2xl border border-gray-200 p-4 md:grid-cols-[1fr_160px_160px_150px_auto] md:items-end"
                  >
                    <div>
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Category
                      </label>
                      <div className="rounded-xl bg-gray-50 px-4 py-3 font-semibold">
                        {category.name || DEFAULT_CATEGORIES[index]?.name}
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Min Price
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={category.min}
                        onChange={(e) => {
                          const value = e.target.value;
                          setCategories((current) =>
                            current.map((item, i) =>
                              i === index ? { ...item, min: value } : item
                            )
                          );
                        }}
                        className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-black"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Max Price
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={category.max}
                        onChange={(e) => {
                          const value = e.target.value;
                          setCategories((current) =>
                            current.map((item, i) =>
                              i === index ? { ...item, max: value } : item
                            )
                          );
                        }}
                        className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-black"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Status
                      </label>

                      <select
                        value={category.status || "ACTIVE"}
                        onChange={(e) => {
                          const value = e.target.value;

                          setCategories((current) =>
                            current.map((item, i) =>
                              i === index
                                ? { ...item, status: value }
                                : item
                            )
                          );
                        }}
                        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none focus:border-black"
                      >
                        <option value="ACTIVE">ACTIVE</option>
                        <option value="INACTIVE">INACTIVE</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={categorySaving}
                        onClick={() => saveCategory(category)}
                        className="flex items-center justify-center gap-2 rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white disabled:opacity-40"
                      >
                        <Save size={17} />
                        Save
                      </button>

                      <button
                        type="button"
                        disabled={categorySaving}
                        onClick={() => deleteCategory(category)}
                        className="flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-100 disabled:opacity-40"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          CREATE CATEGORY MODAL
      ===================================================== */}

      {showCreateCategory && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-black/50 p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white shadow-2xl">

            {/* HEADER */}
            <div className="flex items-center justify-between border-b px-6 py-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-blue-600">
                  CREATE CATEGORY
                </p>

                <h2 className="mt-1 text-2xl font-bold text-gray-900">
                  Create New Card Price Category
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Add a new category for grouping cards by API price.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowCreateCategory(false)}
                className="rounded-xl bg-gray-100 p-2.5 text-gray-600 hover:bg-gray-200"
              >
                <X size={20} />
              </button>
            </div>

            {/* FORM */}
            <div className="space-y-5 p-6">

              {/* NAME */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Category Name
                </label>

                <input
                  type="text"
                  value={newCategory.name}
                  onChange={(e) =>
                    setNewCategory((current) => ({
                      ...current,
                      name: e.target.value,
                    }))
                  }
                  placeholder="B9 Legendary"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-black"
                />
              </div>

              {/* DESCRIPTION */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Description
                </label>

                <textarea
                  rows={3}
                  value={newCategory.description}
                  onChange={(e) =>
                    setNewCategory((current) => ({
                      ...current,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Cards from $125 to $350"
                  className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-black"
                />
              </div>

              {/* PRICE */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Min Price
                  </label>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={newCategory.minPrice}
                    onChange={(e) =>
                      setNewCategory((current) => ({
                        ...current,
                        minPrice: e.target.value,
                      }))
                    }
                    placeholder="125"
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Max Price
                  </label>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={newCategory.maxPrice}
                    onChange={(e) =>
                      setNewCategory((current) => ({
                        ...current,
                        maxPrice: e.target.value,
                      }))
                    }
                    placeholder="350"
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-black"
                  />
                </div>

              </div>

              {/* STATUS + SORT ORDER */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Status
                  </label>

                  <select
                    value={newCategory.status}
                    onChange={(e) =>
                      setNewCategory((current) => ({
                        ...current,
                        status: e.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none focus:border-black"
                  >
                    <option value="ACTIVE">
                      ACTIVE
                    </option>
                    <option value="INACTIVE">
                      INACTIVE
                    </option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Sort Order
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={newCategory.sortOrder}
                    onChange={(e) =>
                      setNewCategory((current) => ({
                        ...current,
                        sortOrder: e.target.value,
                      }))
                    }
                    placeholder="5"
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-black"
                  />
                </div>

              </div>

              {/* PREVIEW */}
              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  Preview
                </p>

                <p className="mt-2 text-lg font-bold text-gray-900">
                  {newCategory.name.trim() ||
                    "B9 Legendary"}
                </p>

                <p className="mt-1 text-sm font-medium text-gray-500">
                  $
                  {newCategory.minPrice || "125"}
                  {" - "}
                  $
                  {newCategory.maxPrice || "350"}
                </p>

                <p className="mt-2 text-xs text-gray-400">
                  {newCategory.status}
                </p>
              </div>

              {/* ACTIONS */}
              <div className="flex justify-end gap-3 border-t pt-5">

                <button
                  type="button"
                  disabled={creatingCategory}
                  onClick={() => {
                    setShowCreateCategory(false);
                    setNewCategory({
                      name: "",
                      description: "",
                      minPrice: "",
                      maxPrice: "",
                      status: "ACTIVE",
                      sortOrder: "",
                    });
                  }}
                  className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-40"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={creatingCategory}
                  onClick={createCategory}
                  className="rounded-xl bg-black px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {creatingCategory
                    ? "Creating..."
                    : "Create Category"}
                </button>

              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          CATEGORY CARD DETAIL
      ===================================================== */}

      {selectedCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 md:p-8">
          <div className="flex h-full w-full max-w-7xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b px-6 py-5 md:px-8">
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {selectedCategory.name}
                  </h2>
                  <span className="shrink-0 text-2xl font-bold text-gray-900">
                    {getCardsForCategory(selectedCategory).length}
                  </span>
                </div>
                <div className="mt-1 flex items-center justify-between gap-6">
                  <p className="text-sm text-gray-500">
                    {getCategoryRange(selectedCategory)}
                  </p>
                  <span className="shrink-0 text-sm text-gray-500">
                    cards
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedCategory(null)}
                className="rounded-xl bg-gray-100 p-2.5 text-gray-600 hover:bg-gray-200"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-auto">
              <table className="w-full min-w-[1200px]">
                <thead className="sticky top-0 border-b bg-gray-50">
                  <tr className="text-left text-xs uppercase tracking-wide text-gray-500">
                    <th className="px-6 py-4">Card</th>
                    <th className="px-6 py-4">Set</th>
                    <th className="px-6 py-4">Number</th>
                    <th className="px-6 py-4">Rarity</th>
                    <th className="px-6 py-4">Price (API price)</th>
                    <th className="px-6 py-4">Available</th>
                    <th className="px-6 py-4">Reserved</th>
                    <th className="px-6 py-4">Consumed</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y">
                  {loading ? (
                    <tr>
                      <td colSpan="9" className="px-6 py-12 text-center text-gray-500">
                        Loading inventory...
                      </td>
                    </tr>
                  ) : getCardsForCategory(selectedCategory).length === 0 ? (
                    <tr>
                      <td colSpan="9" className="px-6 py-12 text-center text-gray-400">
                        No cards in this price category.
                      </td>
                    </tr>
                  ) : (
                    getCardsForCategory(selectedCategory).map((item) => {
                      const card = item.card || {};

                      return (
                        <tr key={item._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-4">
                              <div className="h-16 w-12 overflow-hidden rounded-lg bg-gray-100">
                                {getImage(card) ? (
                                  <img
                                    src={getImage(card)}
                                    alt={card.name || "Card"}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <div className="flex h-full items-center justify-center text-xs text-gray-400">
                                    No image
                                  </div>
                                )}
                              </div>
                              <div>
                                <p className="font-semibold">
                                  {card.name || "Unknown Card"}
                                </p>
                                <p className="mt-1 text-xs text-gray-400">
                                  #{card.number || "-"}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-4 text-sm">{getSetName(card.set)}</td>
                          <td className="px-6 py-4 text-sm">{card.number || "-"}</td>
                          <td className="px-6 py-4 text-sm">{card.rarity || "-"}</td>

                          <td className="px-6 py-4">
                            <p className="text-sm font-semibold">
                              {card.price != null
                                ? `$${Number(card.price).toFixed(2)}`
                                : "-"}
                            </p>
                            {card.priceLastUpdated && (
                              <p className="mt-1 text-[10px] text-gray-400">
                                Updated {new Date(card.priceLastUpdated).toLocaleDateString()}
                              </p>
                            )}
                          </td>

                          <td className="px-6 py-4">
                            <span className="rounded-lg bg-green-100 px-3 py-1.5 text-sm font-semibold text-green-700">
                              {item.available ?? 0}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm">{item.reserved ?? 0}</td>
                          <td className="px-6 py-4 text-sm">{item.consumed ?? 0}</td>

                          <td className="px-6 py-4">
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingCard(item);
                                  setQuantity(item.available ?? 0);
                                }}
                                className="rounded-lg border border-gray-200 p-2 hover:bg-gray-100"
                                title="Update quantity"
                              >
                                <Edit size={17} />
                              </button>

                              <button
                                type="button"
                                onClick={() => refreshCardPrice(card._id)}
                                className="rounded-lg border border-blue-200 p-2 text-blue-600 hover:bg-blue-50"
                                title="Refresh API price"
                              >
                                <RefreshCw size={17} />
                              </button>

                              <button
                                type="button"
                                onClick={() => deleteInventory(card._id)}
                                className="rounded-lg border border-red-200 p-2 text-red-600 hover:bg-red-50"
                                title="Delete inventory"
                              >
                                <Trash2 size={17} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =================================================
          UPDATE MODAL
      ================================================= */}

      {editingCard && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">

            <h2 className="text-xl font-bold">
              Update Inventory
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {editingCard.card?.name}
            </p>


            <div className="mt-5">

              <label className="mb-2 block text-sm font-semibold">
                Available Quantity
              </label>

              <input
                type="number"
                min="0"
                value={quantity}
                onChange={(e) =>
                  setQuantity(
                    e.target.value
                  )
                }
                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-black"
              />

            </div>


            <div className="mt-6 flex justify-end gap-3">

              <button
                onClick={() => {
                  setEditingCard(null);
                  setQuantity("");
                }}
                className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold"
              >
                Cancel
              </button>

              <button
                onClick={updateQuantity}
                className="rounded-xl bg-black px-5 py-2.5 text-sm font-semibold text-white"
              >
                Save Quantity
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}


// =====================================================
// SUMMARY CARD
// =====================================================

function SummaryCard({
  title,
  value,
  icon,
}) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm">

      <div className="flex items-center justify-between">

        <div>

          <p className="text-sm text-gray-500">
            {title}
          </p>

          <p className="mt-2 text-2xl font-bold">
            {Number(value || 0).toLocaleString()}
          </p>

        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100">
          {icon}
        </div>

      </div>

    </div>
  );
}