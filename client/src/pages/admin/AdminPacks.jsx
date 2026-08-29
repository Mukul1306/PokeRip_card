import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import {
  Plus,
  Search,
  Package,
  X,
  Save,
  Loader2,
  Trash2,
  Archive,
  RotateCcw,
  Pencil,
  ChevronLeft,
  ChevronRight,
  ImageOff,
  Check,
  Tags,
} from "lucide-react";


const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";


const EMPTY_FORM = {
  name: "",
  description: "",
  image: "",
  category: "",
  minPrice: "",
  maxPrice: "",
  price: "",
  totalStock: "",
  cardsPerPack: 5,
  status: "DRAFT",
};


export default function AdminPacks() {

  const [packs, setPacks] = useState([]);

  const [categories, setCategories] =
    useState([]);


  const [loading, setLoading] =
    useState(true);

  // const [loadingFormData, setLoadingFormData] =
  //   useState(false);

  const [saving, setSaving] =
    useState(false);

  const [deletingId, setDeletingId] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [categoryFilter, setCategoryFilter] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("");

  const [page, setPage] =
    useState(1);

  const [pagination, setPagination] =
    useState({
      page: 1,
      limit: 20,
      totalPacks: 0,
      totalPages: 0,
    });

  const [showModal, setShowModal] =
    useState(false);

  const [editingPack, setEditingPack] =
    useState(null);

  const [form, setForm] =
    useState(EMPTY_FORM);

   const [imageFile, setImageFile] =
     useState(null); 

  // const [cardSearch, setCardSearch] =
  //   useState("");

const [showCategoryModal, setShowCategoryModal] =
  useState(false);

const [categoryName, setCategoryName] =
  useState("");

const [categoryDescription, setCategoryDescription] =
  useState("");

const [savingCategory, setSavingCategory] =
  useState(false);


  const [selectedPack, setSelectedPack] =
  useState(null);

const [showPackCards, setShowPackCards] =
  useState(false);

const [loadingPackCards, setLoadingPackCards] =
  useState(false);

const [packCards, setPackCards] =
  useState([]);
  // =====================================================
  // FETCH PACKS
  // =====================================================

  const fetchPacks = async (
    requestedPage = page
  ) => {

    try {

      setLoading(true);

      const token =
        localStorage.getItem("token");

      const params =
        new URLSearchParams({
          page: requestedPage,
          limit: 20,
        });

      if (search.trim()) {
        params.append(
          "search",
          search.trim()
        );
      }

      if (categoryFilter) {
        params.append(
          "category",
          categoryFilter
        );
      }

      if (statusFilter) {
        params.append(
          "status",
          statusFilter
        );
      }

      const response =
        await fetch(
          `${API_URL}/api/admin/packs?${params}`,
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to load packs"
        );
      }

      setPacks(
        data.data?.packs || []
      );

      setPagination(
        data.data?.pagination || {}
      );

      setPage(requestedPage);

    } catch (error) {

      console.error(
        "Fetch packs error:",
        error
      );

      alert(error.message);

    } finally {

      setLoading(false);

    }
  };


  // =====================================================
  // FETCH CATEGORIES
  // =====================================================

  const fetchCategories =
    async () => {

      try {

        const token =
          localStorage.getItem("token");

        const response =
          await fetch(
            `${API_URL}/api/admin/pack-categories`,
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Unable to load categories"
          );
        }

        const fetchedCategories =
          data.categories || [];

        setCategories(fetchedCategories);

        return fetchedCategories;

      } catch (error) {

        console.error(
          "Category error:",
          error
        );

      }
    };

    const openPackCards = async (pack) => {
  try {
    setSelectedPack(pack);
    setShowPackCards(true);
    setLoadingPackCards(true);
    setPackCards([]);

    const token =
      localStorage.getItem("token");

    const response = await fetch(
      `${API_URL}/api/admin/odds/${pack._id}`,
      {
        headers: {
          Authorization:
            `Bearer ${token}`,
        },
      }
    );

    const data =
      await response.json();

    if (!response.ok) {
      throw new Error(
        data.message ||
          "Unable to load pack cards"
      );
    }

    console.log("PACK CARDS RESPONSE:", data);
console.log("PACK CARDS:", data.data?.cards);

setPackCards(
  data.data?.cards ||
  data.data?.pack?.cards ||
  []
);

  } catch (error) {

    console.error(
      "Pack cards error:",
      error
    );

    alert(error.message);

  } finally {

    setLoadingPackCards(false);

  }
};

  // =====================================================
  // INITIAL
  // =====================================================

  useEffect(() => {

  fetchPacks(1);

  fetchCategories();


}, []);

const createCategory = async (e) => {
  e.preventDefault();

  if (!categoryName.trim()) {
    alert("Enter category name");
    return;
  }

  try {
    setSavingCategory(true);

    const token = localStorage.getItem("token");

    const response = await fetch(
      `${API_URL}/api/admin/pack-categories`,
      {
        method: "POST",

        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          name: categoryName.trim(),
          description: categoryDescription.trim(),
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Failed to create category"
      );
    }

    alert("Category created successfully");

    setCategoryName("");
    setCategoryDescription("");

    setShowCategoryModal(false);

    // Refresh categories
    await fetchCategories();

  } catch (error) {
    console.error("Create category error:", error);

    alert(error.message);

  } finally {
    setSavingCategory(false);
  }
};
  // =====================================================
  // OPEN CREATE
  // =====================================================

 const openCreate = async () => {
  setEditingPack(null);

  setForm({
    ...EMPTY_FORM,
  });

  setImageFile(null);

  setShowModal(true);

  if (categories.length === 0) {
    await fetchCategories();
  }
};

  // =====================================================
  // OPEN EDIT
  // =====================================================

 const openEdit = async (pack) => {
  setEditingPack(pack);
  setImageFile(null);

  let availableCategories = categories;

  if (availableCategories.length === 0) {
    availableCategories =
      (await fetchCategories()) || [];
  }

  const categoryId =
    pack.category?._id ||
    pack.category ||
    "";

  const selectedCategory =
    availableCategories.find(
      (category) =>
        String(category._id) ===
        String(categoryId)
    );

  setForm({
    name: pack.name || "",
    description: pack.description || "",
    image: "",

    category: categoryId,

    minPrice:
      selectedCategory?.minPrice ??
      pack.priceRange?.min ??
      "",

    maxPrice:
      selectedCategory?.maxPrice ??
      pack.priceRange?.max ??
      "",

    price:
      pack.packPrice ?? pack.price ?? "",

    totalStock:
      pack.totalStock ?? "",

    cardsPerPack:
      pack.cardsPerPack ?? 5,

    status:
      pack.status || "DRAFT",
  });

  setShowModal(true);
};


  // =====================================================
  // FORM CHANGE
  // =====================================================

  const updateField = (
    field,
    value
  ) => {

    setForm(
      (current) => ({
        ...current,
        [field]: value,
      })
    );
  };



  // =====================================================
  // SAVE PACK
  // =====================================================

  const savePack =
    async (event) => {

      event.preventDefault();

      if (!form.name.trim()) {
        alert(
          "Pack name is required"
        );
        return;
      }

      if (!form.category) {
        alert(
          "Please select a category"
        );
        return;
      }

        // if (
        //   form.price === "" ||
        //   Number(form.price) < 0
        // ) {
        //   alert(
        //     "Enter a valid price"
        //   );
        //   return;
        // }
        if (
  form.minPrice === "" ||
  form.maxPrice === "" ||
  Number(form.minPrice) < 0 ||
  Number(form.maxPrice) < 0
) {
  alert(
    "Enter a valid minimum and maximum price"
  );
  return;
}

if (
  Number(form.minPrice) >
  Number(form.maxPrice)
) {
  alert(
    "Minimum price cannot be greater than maximum price"
  );
  return;
}

      const numericPackPrice = Number(form.price);

      if (
        form.price === "" ||
        !Number.isFinite(numericPackPrice) ||
        numericPackPrice < 0
      ) {
        alert("Enter a valid pack price");
        return;
      }

      if (
        form.totalStock === "" ||
        Number(form.totalStock) < 0
      ) {
        alert(
          "Enter valid stock"
        );
        return;
      }
const numericCardsPerPack =
  Number(form.cardsPerPack);

if (
  !Number.isInteger(numericCardsPerPack) ||
  numericCardsPerPack < 1
) {
  alert(
    "Cards per pack must be a positive whole number"
  );
  return;
}

      try {

        setSaving(true);

        const token =
          localStorage.getItem("token");

//  const payload = {
//   name: form.name.trim(),

//   description:
//     form.description.trim(),

//   image:
//     form.image.trim(),

//   category:
//     form.category,

//   minPrice:
//     Number(form.minPrice),

//   maxPrice:
//     Number(form.maxPrice),

//   totalStock:
//     Number(form.totalStock),

//   cardsPerPack:
//     numericCardsPerPack,

//   status:
//     form.status,


  // cards:
  //   form.cards.map((item) => ({
  //     card: item.card,
  //     pullWeight:
  //       Number(item.pullWeight) || 0,
  //     quantity:
  //       Number(item.quantity) || 0,
  //   })),
//};

        const url =
          editingPack
            ? `${API_URL}/api/admin/packs/${editingPack._id}`
            : `${API_URL}/api/admin/packs`;

       const formData = new FormData();

formData.append(
  "name",
  form.name.trim()
);

formData.append(
  "description",
  form.description.trim()
);

formData.append(
  "category",
  form.category
);

formData.append(
  "minPrice",
  String(Number(form.minPrice))
);

formData.append(
  "maxPrice",
  String(Number(form.maxPrice))
);

formData.append(
  "packPrice",
  String(numericPackPrice)
);

formData.append(
  "totalStock",
  String(Number(form.totalStock))
);

formData.append(
  "cardsPerPack",
  String(Number(form.cardsPerPack))
);

formData.append(
  "status",
  form.status
);

if (imageFile) {
  formData.append(
    "image",
    imageFile
  );
}

const response =
  await fetch(url, {
    method:
      editingPack
        ? "PATCH"
        : "POST",

    headers: {
      Authorization:
        `Bearer ${token}`,
    },

    body: formData,
  });
        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Unable to save pack"
          );
        }

setShowModal(false);

setForm(
  EMPTY_FORM
);

setImageFile(null);

        await fetchPacks(
          page
        );

      } catch (error) {

        console.error(
          "Save pack error:",
          error
        );

        alert(error.message);

      } finally {

        setSaving(false);

      }
    };


  // =====================================================
  // ARCHIVE / UNARCHIVE
  // =====================================================

  const archivePack = async (pack) => {
    const isArchived = pack.status === "ARCHIVED";

    const confirmed = window.confirm(
      isArchived
        ? `Unarchive "${pack.name}"?`
        : `Archive "${pack.name}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(pack._id);

      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API_URL}/api/admin/packs/${pack._id}/status`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: isArchived ? "PUBLISHED" : "ARCHIVED",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            (isArchived
              ? "Unable to unarchive pack"
              : "Unable to archive pack")
        );
      }

      await fetchPacks(page);
    } catch (error) {
      console.error(
        isArchived
          ? "Unarchive error:"
          : "Archive error:",
        error
      );

      alert(error.message);
    } finally {
      setDeletingId("");
    }
  };

  // =====================================================
  // PERMANENTLY DELETE PACK
  // =====================================================

  const permanentlyDeletePack = async (pack) => {
    const confirmed = window.confirm(
      `PERMANENTLY DELETE "${pack.name}"?\n\nThis action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(pack._id);

      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API_URL}/api/admin/packs/${pack._id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to delete pack"
        );
      }

      await fetchPacks(page);
    } catch (error) {
      console.error(
        "Delete pack error:",
        error
      );

      alert(error.message);
    } finally {
      setDeletingId("");
    }
  };



  return (
    <div className="space-y-7">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">

        <div>

          <p className="text-[10px] font-black tracking-[0.25em] text-[#238bdc]">
            PACK MANAGEMENT
          </p>

          <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
            Packs
          </h1>

          <p className="mt-2 text-sm text-[#505258]">
            Create and manage the packs available
            on PokeRip.
          </p>

        </div>

<div className="flex gap-2">

  {/* CATEGORY BUTTON */}

  <button
    onClick={() => setShowCategoryModal(true)}
    className="inline-flex items-center justify-center gap-2 rounded-xl border border-black/10 bg-white px-5 py-3 text-xs font-black text-[#505258] hover:bg-black/5"
  >
    <Tags size={15} />
    Categories
  </button>


  {/* CREATE PACK */}

  <button
    onClick={openCreate}
    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#238bdc] px-5 py-3 text-xs font-black text-white shadow-sm transition hover:bg-[#1678c4]"
  >
    <Plus size={15} />
    Create Pack
  </button>

</div>

      </div>


      {/* =================================================
          FILTERS
      ================================================= */}

      <div className="grid gap-3 lg:grid-cols-[1fr_200px_180px]">

        <div className="relative">

          <Search
            size={16}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#888]"
          />

          <input
            value={search}
            onChange={(e) => {
              setSearch(
                e.target.value
              );
              setPage(1);
            }}
            onKeyDown={(e) => {
              if (
                e.key === "Enter"
              ) {
                fetchPacks(1);
              }
            }}
            placeholder="Search packs..."
            className="h-11 w-full rounded-xl border border-black/10 bg-white pl-10 pr-4 text-xs font-semibold outline-none focus:border-[#238bdc]"
          />

        </div>


        <select
          value={categoryFilter}
          onChange={(e) => {
            setCategoryFilter(
              e.target.value
            );
            setPage(1);

            setTimeout(
              () =>
                fetchPacks(1),
              0
            );
          }}
          className="h-11 rounded-xl border border-black/10 bg-white px-3 text-xs font-bold outline-none focus:border-[#238bdc]"
        >

          <option value="">
            All Categories
          </option>

          {categories.map(
            (category) => (
              <option
                key={
                  category._id
                }
                value={
                  category._id
                }
              >
                {category.name}
              </option>
            )
          )}

        </select>


        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(
              e.target.value
            );
            setPage(1);

            setTimeout(
              () =>
                fetchPacks(1),
              0
            );
          }}
          className="h-11 rounded-xl border border-black/10 bg-white px-3 text-xs font-bold outline-none focus:border-[#238bdc]"
        >

          <option value="">
            All Status
          </option>

          <option value="DRAFT">
            Draft
          </option>

          <option value="PUBLISHED">
            Published
          </option>

          <option value="PAUSED">
            Paused
          </option>

          <option value="ARCHIVED">
            Archived
          </option>

        </select>

      </div>


      {/* =================================================
          TABLE
      ================================================= */}

      <section className="overflow-hidden rounded-2xl border border-black/10 bg-white/60">

        <div className="border-b border-black/10 px-6 py-5">

          <h2 className="text-sm font-black">
            All Packs
          </h2>

          <p className="mt-1 text-[10px] text-[#777]">
            {pagination.totalPacks || 0}
            {" "}packs
          </p>

        </div>


        {loading ? (

          <div className="flex min-h-[350px] items-center justify-center">

            <Loader2
              size={28}
              className="animate-spin text-[#238bdc]"
            />

          </div>

        ) : packs.length === 0 ? (

          <div className="flex min-h-[350px] flex-col items-center justify-center">

            <Package
              size={30}
              className="text-[#999]"
            />

            <p className="mt-3 text-sm font-black">
              No packs found
            </p>

            <p className="mt-1 text-xs text-[#777]">
              Create your first pack.
            </p>

          </div>

        ) : (

          <div className="overflow-x-auto">

            <table className="w-full min-w-[950px]">

              <thead>

                <tr className="border-b border-black/10 text-left">

                  <th className="px-6 py-4 text-[9px] font-black tracking-wider text-[#777]">
                    PACK
                  </th>

                  <th className="px-6 py-4 text-[9px] font-black tracking-wider text-[#777]">
                    CATEGORY
                  </th>

                  <th className="px-6 py-4 text-[9px] font-black tracking-wider text-[#777]">
                     PRICE
                   </th>

                  <th className="px-6 py-4 text-[9px] font-black tracking-wider text-[#777]">
                    STOCK
                  </th>

                  <th className="px-6 py-4 text-[9px] font-black tracking-wider text-[#777]">
                    STATUS
                  </th>

                  <th className="px-6 py-4 text-right text-[9px] font-black tracking-wider text-[#777]">
                    ACTION
                  </th>

                </tr>

              </thead>


              <tbody>

                {packs.map(
                  (pack, index) => (

                    <motion.tr
                      key={
                        pack._id
                      }
                      initial={{
                        opacity: 0,
                        y: 8,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      transition={{
                        delay:
                          index *
                          0.03,
                      }}
                      className="border-b border-black/5 hover:bg-black/[0.02]"
                    >

                      <td className="px-6 py-5">

                        <button
  type="button"
  onClick={() => openPackCards(pack)}
  className="flex items-center gap-3 text-left"
>

                          <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-black/5">

                            {pack.image ? (

                              <img
                                src={
                                  pack.image
                                }
                                alt={
                                  pack.name
                                }
                                className="h-full w-full object-cover"
                              />

                            ) : (

                              <Package
                                size={19}
                                className="text-[#999]"
                              />

                            )}

                          </div>


                          <div>

                            <p className="text-xs font-black">
                              {
                                pack.name
                              }
                            </p>

                            <p className="mt-1 text-[9px] text-[#888]">
  {pack.cardsPerPack || 0} cards / pack
</p>

                          </div>

                        </button>

                      </td>


                      <td className="px-6 py-5">

                        <span className="rounded-full bg-[#238bdc]/10 px-3 py-1.5 text-[9px] font-black text-[#238bdc]">
                          {
                            pack
                              .category
                              ?.name ||
                            "—"
                          }
                        </span>

                      </td>


<td className="px-6 py-5">
  <div>
    {/* PACK SELLING PRICE */}
    <p className="text-xs font-black">
      $
      {Number(
        pack.packPrice ?? pack.price ?? 0
      ).toFixed(2)}
    </p>

    {/* CATEGORY CARD PRICE RANGE */}
    <p className="mt-1 text-[9px] font-semibold text-[#888]">
      Card range:{" "}
      {pack.category ? (
        <>
          $
          {Number(
            pack.category.minPrice ?? 0
          ).toFixed(2)}
          {" - "}
          {pack.category.maxPrice === null ||
          pack.category.maxPrice === undefined ? (
            "No limit"
          ) : (
            `$${Number(
              pack.category.maxPrice
            ).toFixed(2)}`
          )}
        </>
      ) : pack.priceRange ? (
        <>
          $
          {Number(
            pack.priceRange.min ?? 0
          ).toFixed(2)}
          {" - "}
          {pack.priceRange.max === null ||
          pack.priceRange.max === undefined ? (
            "No limit"
          ) : (
            `$${Number(
              pack.priceRange.max
            ).toFixed(2)}`
          )}
        </>
      ) : (
        "Not available"
      )}
    </p>
  </div>
</td>


                      <td className="px-6 py-5">

                        <p className="text-xs font-black">
                          {
                            pack.totalStock
                          }
                        </p>

                        <p className="mt-1 text-[9px] text-[#888]">
                          {
                            pack.soldCount ||
                            0
                          }{" "}
                          sold
                        </p>

                      </td>


                      <td className="px-6 py-5">

                        <StatusBadge
                          status={
                            pack.status
                          }
                        />

                      </td>


                      <td className="px-6 py-5">

                        <div className="flex justify-end gap-2">

                          <button
                            onClick={() =>
                              openEdit(
                                pack
                              )
                            }
                            className="flex items-center gap-1.5 rounded-lg bg-black/5 px-3 py-2 text-[10px] font-black text-[#505258] hover:bg-black/10"
                          >
                            <Pencil
                              size={13}
                            />
                            Edit
                          </button>


                          {/* ARCHIVE / UNARCHIVE */}
                          <button
                            type="button"
                            onClick={() =>
                              archivePack(pack)
                            }
                            disabled={
                              deletingId === pack._id
                            }
                            className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-[10px] font-black disabled:opacity-40 ${
                              pack.status === "ARCHIVED"
                                ? "bg-green-500/10 text-green-600 hover:bg-green-500/20"
                                : "bg-orange-500/10 text-orange-600 hover:bg-orange-500/20"
                            }`}
                          >
                            {deletingId === pack._id ? (
                              <Loader2
                                size={13}
                                className="animate-spin"
                              />
                            ) : pack.status === "ARCHIVED" ? (
                              <RotateCcw size={13} />
                            ) : (
                              <Archive size={13} />
                            )}

                            {pack.status === "ARCHIVED"
                              ? "Unarchive"
                              : "Archive"}
                          </button>

                          {/* PERMANENT DELETE */}
                          <button
                            type="button"
                            onClick={() =>
                              permanentlyDeletePack(pack)
                            }
                            disabled={
                              deletingId === pack._id
                            }
                            className="flex items-center gap-1.5 rounded-lg bg-red-500/10 px-3 py-2 text-[10px] font-black text-red-500 hover:bg-red-500/20 disabled:opacity-40"
                          >
                            {deletingId === pack._id ? (
                              <Loader2
                                size={13}
                                className="animate-spin"
                              />
                            ) : (
                              <Trash2 size={13} />
                            )}
                            Delete
                          </button>

                        </div>

                      </td>

                    </motion.tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}


        {/* Pagination */}

        {!loading &&
          pagination.totalPages >
            1 && (

            <div className="flex items-center justify-between border-t border-black/10 px-6 py-4">

              <p className="text-[10px] font-bold text-[#777]">
                Page{" "}
                {pagination.page}
                {" "}of{" "}
                {
                  pagination.totalPages
                }
              </p>


              <div className="flex gap-2">

                <button
                  disabled={
                    page <= 1
                  }
                  onClick={() =>
                    fetchPacks(
                      page - 1
                    )
                  }
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-black/10 bg-white disabled:opacity-30"
                >
                  <ChevronLeft
                    size={15}
                  />
                </button>


                <button
                  disabled={
                    page >=
                    pagination.totalPages
                  }
                  onClick={() =>
                    fetchPacks(
                      page + 1
                    )
                  }
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-black/10 bg-white disabled:opacity-30"
                >
                  <ChevronRight
                    size={15}
                  />
                </button>

              </div>

            </div>

          )}

      </section>


      {/* =================================================
          CREATE / EDIT MODAL
      ================================================= */}

      <AnimatePresence>

        {showModal && (

          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          >

            <motion.div
              initial={{
                opacity: 0,
                scale: 0.96,
                y: 20,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                scale: 0.96,
                y: 20,
              }}
              className="max-h-[85vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-[#f4f4f4] shadow-2xl"
            >

              {/* Modal Header */}

              <div className="sticky top-0 z-20 flex items-center justify-between border-b border-black/10 bg-[#f4f4f4]/95 px-6 py-5 backdrop-blur">

                <div>

                  <p className="text-[9px] font-black tracking-[0.2em] text-[#238bdc]">
                    PACK CONFIGURATION
                  </p>

                  <h2 className="mt-1 text-xl font-black">
                    {editingPack
                      ? "Edit Pack"
                      : "Create Pack"}
                  </h2>

                </div>


                <button
                  onClick={() =>
                    setShowModal(
                      false
                    )
                  }
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-black/5 hover:bg-black/10"
                >
                  <X size={17} />
                </button>

              </div>


              <form
                onSubmit={
                  savePack
                }
                className="p-4 flex flex-col"
              >

<div className="grid gap-4 grid-cols-1">
                    {/* LEFT */}

                  <div className="space-y-3">

                    <div>

                      <label className="text-[10px] font-black text-[#555]">
                        PACK NAME
                      </label>

                      <input
                        value={
                          form.name
                        }
                        onChange={(e) =>
                          updateField(
                            "name",
                            e.target.value
                          )
                        }
                        placeholder="e.g. Charizard Premium Pack"
                        className="mt-2 h-11 w-full rounded-xl border border-black/10 bg-white px-4 text-xs font-semibold outline-none focus:border-[#238bdc]"
                      />

                    </div>


                    <div>

                      <label className="text-[10px] font-black text-[#555]">
                        CATEGORY
                      </label>

                      <select
                        value={
                          form.category
                        }
                        onChange={(e) => {
                          const categoryId =
                            e.target.value;

                          const selectedCategory =
                            categories.find(
                              (category) =>
                                String(category._id) ===
                                String(categoryId)
                            );

                          updateField(
                            "category",
                            categoryId
                          );

                          updateField(
                            "minPrice",
                            selectedCategory?.minPrice ?? ""
                          );

                          updateField(
                            "maxPrice",
                            selectedCategory?.maxPrice ?? ""
                          );
                        }}
                        className="mt-2 h-11 w-full rounded-xl border border-black/10 bg-white px-4 text-xs font-bold outline-none focus:border-[#238bdc]"
                      >

                        <option value="">
                          Select category
                        </option>

                        {categories
                          .filter(
                            (
                              category
                            ) =>
                              category.status ===
                              "ACTIVE"
                          )
                          .map(
                            (
                              category
                            ) => (
                              <option
                                key={
                                  category._id
                                }
                                value={
                                  category._id
                                }
                              >
                                {
                                  category.name
                                }
                              </option>
                            )
                          )}

                      </select>
                      {/* {form.category && (
  <div className="mt-3 rounded-xl border border-black/10 bg-white px-4 py-3">
    <p className="text-[10px] font-black text-[#555]">
      CARD PRICE RANGE
    </p>

    {(() => {
      const selectedCategory =
        categories.find(
          (category) =>
            String(category._id) ===
            String(form.category)
        );

      if (!selectedCategory) {
        return (
          <p className="mt-1 text-xs font-bold text-[#999]">
            Category not found
          </p>
        );
      }

      return (
        <p className="mt-1 text-sm font-black text-[#238bdc]">
          ${Number(
            selectedCategory.minPrice || 0
          ).toFixed(2)}

          {" - "}

          {selectedCategory.maxPrice === null ||
          selectedCategory.maxPrice === undefined
            ? "No limit"
            : `$${Number(
                selectedCategory.maxPrice
              ).toFixed(2)}`}
        </p>
      );
    })()}
  </div>
)} */}

                    </div>


                    <div className="grid gap-3 sm:grid-cols-2">

                      {/* CATEGORY CARD PRICE RANGE - AUTOMATIC */}
                      <div>
                        <label className="text-[10px] font-black text-[#555]">
                          MINIMUM CARD PRICE
                        </label>

                        <input
                          type="text"
                          readOnly
                          value={
                            form.category &&
                            form.minPrice !== ""
                              ? `$${Number(form.minPrice).toFixed(2)}`
                              : "Select category"
                          }
                          className="mt-2 h-11 w-full rounded-xl border border-black/10 bg-black/[0.03] px-4 text-xs font-bold text-[#777] outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-black text-[#555]">
                          MAXIMUM CARD PRICE
                        </label>

                        <input
                          type="text"
                          readOnly
                          value={
                            !form.category
                              ? "Select category"
                              : form.maxPrice === "" ||
                                form.maxPrice === null ||
                                form.maxPrice === undefined
                              ? "No limit"
                              : `$${Number(form.maxPrice).toFixed(2)}`
                          }
                          className="mt-2 h-11 w-full rounded-xl border border-black/10 bg-black/[0.03] px-4 text-xs font-bold text-[#777] outline-none"
                        />
                      </div>

                      {/* ADMIN-CONTROLLED PACK PRICE */}
                      <div>
                        <label className="text-[10px] font-black text-[#555]">
                          PACK PRICE
                        </label>

                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={form.price}
                          onChange={(e) =>
                            updateField(
                              "price",
                              e.target.value
                            )
                          }
                          placeholder="19.99"
                          className="mt-2 h-11 w-full rounded-xl border border-black/10 bg-white px-4 text-xs font-bold outline-none focus:border-[#238bdc]"
                        />

                        <p className="mt-1 text-[9px] text-[#888]">
                          Selling price set by admin
                        </p>
                      </div>

                      {/* STOCK */}
                      <div>
                        <label className="text-[10px] font-black text-[#555]">
                          STOCK
                        </label>

                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={form.totalStock}
                          onChange={(e) =>
                            updateField(
                              "totalStock",
                              e.target.value
                            )
                          }
                          placeholder="500"
                          className="mt-2 h-11 w-full rounded-xl border border-black/10 bg-white px-4 text-xs font-bold outline-none focus:border-[#238bdc]"
                        />
                      </div>

                      {/* CARDS PER PACK */}
                      <div>
                        <label className="text-[10px] font-black text-[#555]">
                          CARDS PER PACK
                        </label>

                        <input
                          type="number"
                          min="1"
                          step="1"
                          value={form.cardsPerPack}
                          onChange={(e) =>
                            updateField(
                              "cardsPerPack",
                              e.target.value
                            )
                          }
                          placeholder="5"
                          className="mt-2 h-11 w-full rounded-xl border border-black/10 bg-white px-4 text-xs font-bold outline-none focus:border-[#238bdc]"
                        />
                      </div>

                    </div>


                    </div>


                    {/* <div>

                      <label className="text-[10px] font-black text-[#555]">
                        IMAGE URL
                      </label>

                      <input
                        value={
                          form.image
                        }
                        onChange={(e) =>
                          updateField(
                            "image",
                            e.target.value
                          )
                        }
                        placeholder="https://..."
                        className="mt-2 h-11 w-full rounded-xl border border-black/10 bg-white px-4 text-xs font-semibold outline-none focus:border-[#238bdc]"
                      />

                    </div> */}

                    <div>
  <label className="text-[10px] font-black text-[#555]">
    PACK IMAGE
  </label>

  <input
    type="file"
    accept="image/*"
    onChange={(e) =>
      setImageFile(
        e.target.files?.[0] || null
      )
    }
    className="mt-2 h-11 w-full rounded-xl border border-black/10 bg-white px-4 py-2 text-xs font-semibold outline-none focus:border-[#238bdc]"
  />

  {imageFile && (
  <div className="mt-2">
    <img
      src={URL.createObjectURL(imageFile)}
      alt="Pack preview"
      className="h-20 w-20 rounded-lg object-cover border border-black/10"
    />
  </div>
)}

  {imageFile && (
    <p className="mt-1 text-[9px] font-semibold text-[#777]">
      Selected: {imageFile.name}
    </p>
  )}
</div>


                    <div>

                      <label className="text-[10px] font-black text-[#555]">
                        DESCRIPTION
                      </label>

                      <textarea
                        rows={3}
                        value={
                          form.description
                        }
                        onChange={(e) =>
                          updateField(
                            "description",
                            e.target.value
                          )
                        }
                        placeholder="Describe this pack..."
                        className="mt-2 w-full resize-none rounded-xl border border-black/10 bg-white p-4 text-xs font-semibold outline-none focus:border-[#238bdc]"
                      />

                    </div>


                    <div>

                      <label className="text-[10px] font-black text-[#555]">
                        STATUS
                      </label>

                      <select
                        value={
                          form.status
                        }
                        onChange={(e) =>
                          updateField(
                            "status",
                            e.target.value
                          )
                        }
                        className="mt-2 h-11 w-full rounded-xl border border-black/10 bg-white px-4 text-xs font-bold outline-none focus:border-[#238bdc]"
                      >

                        <option value="DRAFT">
                          Draft
                        </option>

                        <option value="PUBLISHED">
                          Published
                        </option>

                        <option value="PAUSED">
                          Paused
                        </option>

                      </select>

                    </div>

                  </div>


                  {/* RIGHT */}

                   <div className="space-y-3">

                  {/*  <div>

                      <div className="flex items-end justify-between gap-3">

                        <div>

                          <label className="text-[10px] font-black text-[#555]">
                            PACK CARDS
                          </label>

                          <p className="mt-1 text-[10px] text-[#888]">
                            Select cards from your
                            saved Card Library.
                          </p>

                        </div>

                        <span className="rounded-full bg-[#238bdc]/10 px-3 py-1.5 text-[9px] font-black text-[#238bdc]">
                          {
                            form.cards
                              .length
                          }{" "}
                          selected
                        </span>

                      </div>


                      <div className="relative mt-3">

                        <Search
                          size={15}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-[#999]"
                        />

                        <input
                          value={
                            cardSearch
                          }
                          onChange={(e) =>
                            setCardSearch(
                              e.target.value
                            )
                          }
                          placeholder="Search saved cards..."
                          className="h-10 w-full rounded-xl border border-black/10 bg-white pl-9 pr-3 text-xs font-semibold outline-none focus:border-[#238bdc]"
                        />

                      </div> */}

                    </div>



                {/* FOOTER */}

<div className="sticky bottom-0 z-10 mt-2 flex flex-col-reverse gap-2 border-t border-black/10 bg-[#f4f4f4] pt-2 sm:flex-row sm:justify-end">                  <button
                    type="button"
                    onClick={() =>
                      setShowModal(
                        false
                      )
                    }
                   className="rounded-lg bg-black/5 px-4 py-2 text-xs font-black text-[#505258] hover:bg-black/10"
                  >
                    Cancel
                  </button>


                  <button
                    type="submit"
                    disabled={
                      saving
                    }
                    className="flex items-center justify-center gap-2 rounded-lg bg-[#238bdc] px-5 py-2 text-xs font-black text-white hover:bg-[#1678c4] disabled:opacity-50"
                  >

                    {saving ? (

                      <Loader2
                        size={15}
                        className="animate-spin"
                      />

                    ) : (

                      <Save
                        size={15}
                      />

                    )}

                    {editingPack
                      ? "Update Pack"
                      : "Create Pack"}

                  </button>

                                 </div>

              </form>

              

            </motion.div>

          </motion.div>

        )}

         </AnimatePresence>


      {/* ================================
          CREATE CATEGORY MODAL
      ================================= */}

      <AnimatePresence>

        {showCategoryModal && (

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          >

            <motion.div
              initial={{
                opacity: 0,
                scale: 0.95,
                y: 20,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                scale: 0.95,
                y: 20,
              }}
              className="w-full max-w-md rounded-3xl bg-[#f4f4f4] shadow-2xl"
            >

              {/* Header */}

              <div className="flex items-center justify-between border-b border-black/10 px-6 py-5">

                <div>

                  <p className="text-[9px] font-black tracking-[0.2em] text-[#238bdc]">
                    PACK MANAGEMENT
                  </p>

                  <h2 className="mt-1 text-xl font-black">
                    Create Category
                  </h2>

                </div>

                <button
                  type="button"
                  onClick={() =>
                    setShowCategoryModal(false)
                  }
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-black/5 hover:bg-black/10"
                >
                  <X size={17} />
                </button>

              </div>


              {/* Form */}

              <form
                onSubmit={createCategory}
                className="space-y-5 p-6"
              >

                {/* Category Name */}

                <div>

                  <label className="text-[10px] font-black text-[#555]">
                    CATEGORY NAME
                  </label>

                  <input
                    type="text"
                    value={categoryName}
                    onChange={(e) =>
                      setCategoryName(e.target.value)
                    }
                    placeholder="Example: Premium"
                    className="mt-2 h-11 w-full rounded-xl border border-black/10 bg-white px-4 text-xs font-bold outline-none focus:border-[#238bdc]"
                  />

                </div>


                {/* Description */}

                <div>

                  <label className="text-[10px] font-black text-[#555]">
                    DESCRIPTION
                  </label>

                  <textarea
                    rows={4}
                    value={categoryDescription}
                    onChange={(e) =>
                      setCategoryDescription(
                        e.target.value
                      )
                    }
                    placeholder="Premium card packs"
                    className="mt-2 w-full resize-none rounded-xl border border-black/10 bg-white p-4 text-xs font-semibold outline-none focus:border-[#238bdc]"
                  />

                </div>


                {/* Buttons */}

                <div className="flex justify-end gap-3 border-t border-black/10 pt-5">

                  <button
                    type="button"
                    onClick={() =>
                      setShowCategoryModal(false)
                    }
                    className="rounded-xl bg-black/5 px-5 py-3 text-xs font-black text-[#505258] hover:bg-black/10"
                  >
                    Cancel
                  </button>


                  <button
                    type="submit"
                    disabled={savingCategory}
                    className="flex items-center gap-2 rounded-xl bg-[#238bdc] px-6 py-3 text-xs font-black text-white hover:bg-[#1678c4] disabled:opacity-50"
                  >

                    {savingCategory ? (
                      <Loader2
                        size={15}
                        className="animate-spin"
                      />
                    ) : (
                      <Save size={15} />
                    )}

                    Create Category

                  </button>

                </div>

              </form>

            </motion.div>

          </motion.div>

        )}

      </AnimatePresence>


    </div>
  );
}


// =========================================================
// STATUS
// =========================================================

function StatusBadge({ status }) {
  const styles = {
    DRAFT: "bg-yellow-500/10 text-yellow-600",
    PUBLISHED: "bg-green-500/10 text-green-600",
    PAUSED: "bg-orange-500/10 text-orange-600",
    ARCHIVED: "bg-red-500/10 text-red-500",
  };

  return (
    <span
      className={`rounded-full px-3 py-1.5 text-[9px] font-black ${
        styles[status] || "bg-black/5 text-[#777]"
      }`}
    >
      {status}
    </span>
  );
}