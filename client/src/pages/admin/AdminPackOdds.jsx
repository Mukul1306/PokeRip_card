import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import {
  Plus,
  Search,
  Package,
  X,
  Save,
  Loader2,
  Trash2,
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
  price: "",
  totalStock: "",
  status: "DRAFT",
  cards: [],
};


export default function AdminPacks() {

  const [packs, setPacks] = useState([]);

  const [categories, setCategories] =
    useState([]);

  const [availableCards, setAvailableCards] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [loadingFormData, setLoadingFormData] =
    useState(false);

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

  const [cardSearch, setCardSearch] =
    useState("");

const [showCategoryModal, setShowCategoryModal] =
  useState(false);

const [categoryName, setCategoryName] =
  useState("");

const [categoryDescription, setCategoryDescription] =
  useState("");

const [savingCategory, setSavingCategory] =
  useState(false);
  const [showPackCards, setShowPackCards] =
  useState(false);

const [selectedPack, setSelectedPack] =
  useState(null);

const [selectedCard, setSelectedCard] =
  useState(null);

const [packCards, setPackCards] =
  useState([]);

const [loadingPackCards, setLoadingPackCards] =
  useState(false);
  // =====================================================
  // FETCH PACKS
  // =====================================================

  const fetchPacks = async (
    requestedPage = page
  ) => {

    try {

      setLoading(true);

      const token =
        localStorage.getItem("adminToken");

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
          localStorage.getItem("adminToken");

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

        setCategories(
          data.categories || []
        );

      } catch (error) {

        console.error(
          "Category error:",
          error
        );

      }
    };


  // =====================================================
  // FETCH SAVED CARDS
  // =====================================================

  const fetchCards =
    async () => {

      try {

        setLoadingFormData(true);

        const token =
          localStorage.getItem("adminToken");

        const response =
          await fetch(
            `${API_URL}/api/admin/cards?limit=100`,
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
              "Unable to load cards"
          );
        }

        const cards =
          data.data?.cards ||
          data.cards ||
          [];

        setAvailableCards(cards);

        return cards;

      } catch (error) {

        console.error(
          "Cards error:",
          error
        );

        alert(error.message);

      } finally {

        setLoadingFormData(false);

      }
    };


  // =====================================================
  // OPEN PACK CARDS
  // =====================================================

  const openPackCards = async (pack) => {
    try {
      setSelectedPack(pack);
      setSelectedCard(null);
      setPackCards([]);
      setShowPackCards(true);
      setLoadingPackCards(true);

      const token = localStorage.getItem("adminToken");

      const response = await fetch(
        `${API_URL}/api/admin/odds/${pack._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to load pack cards"
        );
      }

      const oddsCards =
        data.data?.cards ||
        data.data?.odds ||
        data.cards ||
        [];

      let cardLibrary = availableCards;
      if (cardLibrary.length === 0) {
        cardLibrary = (await fetchCards()) || [];
      }

      const resolvedCards =
        (oddsCards.length ? oddsCards : (pack.cards || []))
          .map((packCard) => {
            const embeddedCard =
              packCard?.card && typeof packCard.card === "object"
                ? packCard.card
                : packCard && packCard._id
                  ? packCard
                  : null;

            const cardId =
              embeddedCard?._id ||
              packCard?.card?._id ||
              packCard?.card ||
              packCard?._id;

            const savedCard = cardLibrary.find(
              (item) => String(item._id) === String(cardId)
            );

            const embeddedPrice =
              Number(embeddedCard?.price) > 0
                ? embeddedCard.price
                : Number(embeddedCard?.marketPrice) > 0
                  ? embeddedCard.marketPrice
                  : null;

            const savedPrice =
              Number(savedCard?.price) > 0
                ? savedCard.price
                : Number(savedCard?.marketPrice) > 0
                  ? savedCard.marketPrice
                  : null;

            return {
              ...packCard,
              card: {
                ...(savedCard || {}),
                ...(embeddedCard || {}),
                price: embeddedPrice ?? savedPrice ?? 0,
              },
            };
          });

      setPackCards(resolvedCards);
    } catch (error) {
      console.error("Pack cards error:", error);
      alert(error.message);
      setPackCards(pack.cards || []);
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
    fetchCards();

  }, []);

const createCategory = async (e) => {
  e.preventDefault();

  if (!categoryName.trim()) {
    alert("Enter category name");
    return;
  }

  try {
    setSavingCategory(true);

    const token = localStorage.getItem("adminToken");

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

  const openCreate =
    async () => {

      setEditingPack(null);

      setForm(
        EMPTY_FORM
      );

      setCardSearch("");

      setShowModal(true);

      if (
        availableCards.length === 0
      ) {
        await fetchCards();
      }

      if (
        categories.length === 0
      ) {
        await fetchCategories();
      }
    };


  // =====================================================
  // OPEN EDIT
  // =====================================================

  const openEdit =
    async (pack) => {

      setEditingPack(pack);

      setForm({
        name:
          pack.name || "",

        description:
          pack.description || "",

        image:
          pack.image || "",

        category:
          pack.category?._id ||
          pack.category ||
          "",

        price:
          pack.price ?? "",

        totalStock:
          pack.totalStock ?? "",

        status:
          pack.status || "DRAFT",

        cards:
          (pack.cards || []).map(
            (item) => ({
              card:
                item.card?._id ||
                item.card,

              pullWeight:
                item.pullWeight ?? 0,

              quantity:
                item.quantity ?? 0,
            })
          ),
      });

      setCardSearch("");

      setShowModal(true);

      if (
        availableCards.length === 0
      ) {
        await fetchCards();
      }

      if (
        categories.length === 0
      ) {
        await fetchCategories();
      }
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
  // ADD CARD
  // =====================================================

  const addCardToPack =
    (card) => {

      const alreadyAdded =
        form.cards.some(
          (item) =>
            item.card ===
            card._id
        );

      if (alreadyAdded) {
        return;
      }

      setForm(
        (current) => ({
          ...current,

          cards: [
            ...current.cards,

            {
              card: card._id,
              pullWeight: 1,
              quantity: 1,
            },
          ],
        })
      );
    };


  // =====================================================
  // REMOVE CARD
  // =====================================================

  const removeCardFromPack =
    (cardId) => {

      setForm(
        (current) => ({
          ...current,

          cards:
            current.cards.filter(
              (item) =>
                item.card !==
                cardId
            ),
        })
      );
    };


  // =====================================================
  // UPDATE CARD FIELD
  // =====================================================

  const updatePackCard =
    (
      cardId,
      field,
      value
    ) => {

      setForm(
        (current) => ({
          ...current,

          cards:
            current.cards.map(
              (item) =>
                item.card ===
                cardId
                  ? {
                      ...item,
                      [field]:
                        value,
                    }
                  : item
            ),
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

      if (
        form.price === "" ||
        Number(form.price) < 0
      ) {
        alert(
          "Enter a valid price"
        );
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

      try {

        setSaving(true);

        const token =
          localStorage.getItem("adminToken");

        const payload = {
          name:
            form.name.trim(),

          description:
            form.description.trim(),

          image:
            form.image.trim(),

          category:
            form.category,

          price:
            Number(form.price),

          totalStock:
            Number(
              form.totalStock
            ),

          status:
            form.status,

          cards:
            form.cards.map(
              (item) => ({
                card:
                  item.card,

                pullWeight:
                  Number(
                    item.pullWeight
                  ) || 0,

                quantity:
                  Number(
                    item.quantity
                  ) || 0,
              })
            ),
        };

        const url =
          editingPack
            ? `${API_URL}/api/admin/packs/${editingPack._id}`
            : `${API_URL}/api/admin/packs`;

        const response =
          await fetch(url, {
            method:
              editingPack
                ? "PATCH"
                : "POST",

            headers: {
              Authorization:
                `Bearer ${token}`,

              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify(
                payload
              ),
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
  // ARCHIVE
  // =====================================================

  const archivePack =
    async (pack) => {

      const confirmed =
        window.confirm(
          `Archive "${pack.name}"?`
        );

      if (!confirmed) {
        return;
      }

      try {

        setDeletingId(
          pack._id
        );

        const token =
          localStorage.getItem("adminToken");

        const response =
          await fetch(
            `${API_URL}/api/admin/packs/${pack._id}`,
            {
              method: "DELETE",

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
              "Unable to archive pack"
          );
        }

        await fetchPacks(
          page
        );

      } catch (error) {

        console.error(
          "Archive error:",
          error
        );

        alert(error.message);

      } finally {

        setDeletingId("");

      }
    };


  // =====================================================
  // FILTERED CARDS
  // =====================================================

  const filteredCards =
    useMemo(() => {

      const query =
        cardSearch
          .trim()
          .toLowerCase();

      if (!query) {
        return availableCards;
      }

      return availableCards.filter(
        (card) =>
          card.name
            ?.toLowerCase()
            .includes(query) ||
          card.tcgId
            ?.toLowerCase()
            .includes(query) ||
          card.set?.name
            ?.toLowerCase()
            .includes(query)
      );

    }, [
      availableCards,
      cardSearch,
    ]);


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
                              {
                                pack.cards
                                  ?.length ||
                                0
                              }{" "}
                              cards
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


                      <td className="px-6 py-5 text-xs font-black">
                        $
                        {Number(
                          pack.price
                        ).toFixed(2)}
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


                          <button
                            onClick={() =>
                              archivePack(
                                pack
                              )
                            }
                            disabled={
                              deletingId ===
                              pack._id
                            }
                            className="flex items-center gap-1.5 rounded-lg bg-red-500/10 px-3 py-2 text-[10px] font-black text-red-500 hover:bg-red-500/20 disabled:opacity-40"
                          >

                            {deletingId ===
                            pack._id ? (
                              <Loader2
                                size={13}
                                className="animate-spin"
                              />
                            ) : (
                              <Trash2
                                size={13}
                              />
                            )}

                            Archive

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

      {showPackCards && selectedPack && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">

          <div className="max-h-[92vh] w-full max-w-6xl overflow-y-auto rounded-3xl bg-[#f4f4f4] p-6 shadow-2xl">

            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-[9px] font-black tracking-[0.2em] text-[#238bdc]">
                  PACK CARDS
                </p>
                <h2 className="mt-1 text-2xl font-black">
                  {selectedPack.name}
                </h2>
                <p className="mt-1 text-xs text-[#777]">
                  {packCards.length} card{packCards.length === 1 ? "" : "s"} in this pack
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowPackCards(false);
                  setSelectedPack(null);
                  setSelectedCard(null);
                  setPackCards([]);
                }}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-black/5 hover:bg-black/10"
              >
                <X size={18} />
              </button>
            </div>

            {loadingPackCards ? (
              <div className="flex min-h-[300px] items-center justify-center rounded-2xl border border-black/10 bg-white">
                <Loader2 size={30} className="animate-spin text-[#238bdc]" />
              </div>
            ) : packCards.length === 0 ? (
              <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-dashed border-black/15 bg-white text-center">
                <Package size={32} className="text-[#aaa]" />
                <p className="mt-3 text-sm font-black">
                  No cards found in this pack.
                </p>
              </div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {packCards.map((packCard, index) => {
                  const embeddedCard =
                    packCard?.card && typeof packCard.card === "object"
                      ? packCard.card
                      : packCard && !packCard.card && packCard._id
                        ? packCard
                        : null;

                  const cardId =
                    embeddedCard?._id ||
                    packCard?.card?._id ||
                    packCard?.card ||
                    packCard?._id;

                  const card =
                    embeddedCard ||
                    availableCards.find(
                      (item) => String(item._id) === String(cardId)
                    );

                  if (!card) {
                    return (
                      <div
                        key={index}
                        className="rounded-2xl border border-black/10 bg-white p-4"
                      >
                        <div className="flex h-64 items-center justify-center rounded-xl bg-gray-100 text-center text-xs text-gray-400">
                          Card details not found
                        </div>
                        <p className="mt-3 text-xs font-bold text-gray-500">
                          Card ID: {String(cardId || "—")}
                        </p>
                      </div>
                    );
                  }

                  const image =
                    card.imageLarge ||
                    card.imageSmall ||
                    card.image ||
                    card.images?.large ||
                    card.images?.small ||
                    "";

                  const imageUrl = image
                    ? image.startsWith("http")
                      ? image
                      : `${API_URL}${image.startsWith("/") ? "" : "/"}${image}`
                    : "";

                  return (
                    <button
                      key={card._id || index}
                      type="button"
                      onClick={() => setSelectedCard(card)}
                      className="rounded-2xl border border-black/10 bg-white p-4 text-left transition hover:-translate-y-1 hover:shadow-lg"
                    >
                      <div className="flex h-64 items-center justify-center overflow-hidden rounded-xl bg-[#f7f7f7]">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={card.name || "Pokemon Card"}
                            className="h-full max-w-full rounded-xl object-contain"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
                            No Image
                          </div>
                        )}
                      </div>

                      <p className="mt-3 truncate text-sm font-black">
                        {card.name || "Unknown Card"}
                      </p>

                      <p className="mt-1 text-[10px] text-[#888]">
                        {card.set?.name || "Unknown Set"}
                      </p>

                      <p className="mt-1 text-[10px] text-[#888]">
                        #{card.number || "—"}
                      </p>

                      <p className="mt-2 text-xs font-black">
                        Price: ${Number(
                           card.price ??
                           card.marketPrice ??
                           card.apiPrice ??
                           card.currentPrice ??
                           card.market_data?.prices?.market ??
                           0
                         ).toFixed(2)}
                      </p>
                    </button>
                  );
                })}
              </div>
            )}

            {selectedCard && (
              <div className="mt-6 rounded-2xl border border-black/10 bg-white p-5">
                <div className="flex flex-col gap-5 sm:flex-row">
                  <div className="flex h-80 w-full items-center justify-center rounded-xl bg-[#f7f7f7] sm:w-56">
                    {(() => {
                      const image =
                        selectedCard.imageLarge ||
                        selectedCard.imageSmall ||
                        selectedCard.image ||
                        selectedCard.images?.large ||
                        selectedCard.images?.small ||
                        "";
                      const imageUrl = image
                        ? image.startsWith("http")
                          ? image
                          : `${API_URL}${image.startsWith("/") ? "" : "/"}${image}`
                        : "";

                      return imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={selectedCard.name || "Pokemon Card"}
                          className="h-full max-w-full rounded-xl object-contain"
                        />
                      ) : (
                        <span className="text-xs text-gray-400">No Image</span>
                      );
                    })()}
                  </div>

                  <div className="flex-1">
                    <p className="text-[9px] font-black tracking-widest text-[#238bdc]">
                      SELECTED CARD
                    </p>

                    <h3 className="mt-2 text-2xl font-black">
                      {selectedCard.name || "Unknown Card"}
                    </h3>

                    <div className="mt-4 space-y-2 text-sm text-[#666]">
                      <p>Set: {selectedCard.set?.name || "—"}</p>
                      <p>Number: {selectedCard.number || "—"}</p>
                      <p>Rarity: {selectedCard.rarity || "—"}</p>
                      <p>
                        Price: ${Number(
                          selectedCard.price ??
                          selectedCard.marketPrice ??
                          selectedCard.apiPrice ??
                          selectedCard.currentPrice ??
                          selectedCard.market_data?.prices?.market ??
                          0
                        ).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

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
              className="max-h-[92vh] w-full max-w-6xl overflow-y-auto rounded-3xl bg-[#f4f4f4] shadow-2xl"
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
                className="p-6"
              >

                <div className="grid gap-6 lg:grid-cols-[350px_1fr]">

                  {/* LEFT */}

                  <div className="space-y-5">

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
                        onChange={(e) =>
                          updateField(
                            "category",
                            e.target.value
                          )
                        }
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

                    </div>


                    <div className="grid grid-cols-2 gap-3">

                      <div>

                        <label className="text-[10px] font-black text-[#555]">
                          PRICE
                        </label>

                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={
                            form.price
                          }
                          onChange={(e) =>
                            updateField(
                              "price",
                              e.target.value
                            )
                          }
                          placeholder="19.99"
                          className="mt-2 h-11 w-full rounded-xl border border-black/10 bg-white px-4 text-xs font-bold outline-none focus:border-[#238bdc]"
                        />

                      </div>


                      <div>

                        <label className="text-[10px] font-black text-[#555]">
                          STOCK
                        </label>

                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={
                            form.totalStock
                          }
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

                    </div>


                    <div>

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

                    </div>


                    <div>

                      <label className="text-[10px] font-black text-[#555]">
                        DESCRIPTION
                      </label>

                      <textarea
                        rows={5}
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

                  <div className="space-y-5">

                    <div>

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

                      </div>

                    </div>


                    {/* CARD SELECTOR */}

                    <div className="max-h-[300px] space-y-2 overflow-y-auto rounded-2xl border border-black/10 bg-white p-3">

                      {loadingFormData ? (

                        <div className="flex h-32 items-center justify-center">

                          <Loader2
                            size={22}
                            className="animate-spin text-[#238bdc]"
                          />

                        </div>

                      ) : filteredCards.length === 0 ? (

                        <div className="flex h-32 flex-col items-center justify-center text-center">

                          <ImageOff
                            size={22}
                            className="text-[#aaa]"
                          />

                          <p className="mt-2 text-xs font-bold text-[#777]">
                            No saved cards found.
                          </p>

                        </div>

                      ) : (

                        filteredCards.map(
                          (card) => {

                            const selected =
                              form.cards.some(
                                (item) =>
                                  item.card ===
                                  card._id
                              );

                            return (

                              <div
                                key={
                                  card._id
                                }
                                className="flex items-center gap-3 rounded-xl border border-black/5 bg-[#fafafa] p-2.5"
                              >

                                <img
                                  src={
                                    card.imageSmall
                                  }
                                  alt={
                                    card.name
                                  }
                                  className="h-14 w-10 rounded-md object-cover"
                                />


                                <div className="min-w-0 flex-1">

                                  <p className="truncate text-xs font-black">
                                    {
                                      card.name
                                    }
                                  </p>

                                  <p className="truncate text-[9px] text-[#888]">
                                    {
                                      card
                                        .set
                                        ?.name
                                    }
                                    {" • "}
                                    #
                                    {
                                      card.number
                                    }
                                  </p>

                                </div>


                                <button
                                  type="button"
                                  disabled={
                                    selected
                                  }
                                  onClick={() =>
                                    addCardToPack(
                                      card
                                    )
                                  }
                                  className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                                    selected
                                      ? "bg-green-500/10 text-green-500"
                                      : "bg-[#238bdc]/10 text-[#238bdc] hover:bg-[#238bdc]/20"
                                  }`}
                                >

                                  {selected ? (
                                    <Check
                                      size={14}
                                    />
                                  ) : (
                                    <Plus
                                      size={14}
                                    />
                                  )}

                                </button>

                              </div>

                            );
                          }
                        )

                      )}

                    </div>


                    {/* SELECTED CARDS */}

                    <div>

                      <p className="text-[10px] font-black text-[#555]">
                        SELECTED CARDS
                      </p>


                      <div className="mt-3 space-y-2">

                        {form.cards.length ===
                        0 ? (

                          <div className="rounded-2xl border border-dashed border-black/15 p-8 text-center">

                            <Package
                              size={24}
                              className="mx-auto text-[#aaa]"
                            />

                            <p className="mt-2 text-xs font-bold text-[#777]">
                              No cards selected
                            </p>

                          </div>

                        ) : (

                          form.cards.map(
                            (packCard) => {

                              const card =
                                availableCards.find(
                                  (
                                    item
                                  ) =>
                                    item._id ===
                                    packCard.card
                                );

                              if (!card) {
                                return null;
                              }

                              return (

                                <div
                                  key={
                                    card._id
                                  }
                                  className="rounded-2xl border border-black/10 bg-white p-3"
                                >

                                  <div className="flex items-center gap-3">

                                    <img
                                      src={
                                        card.imageSmall
                                      }
                                      alt={
                                        card.name
                                      }
                                      className="h-16 w-12 rounded-lg object-cover"
                                    />

                                    <div className="min-w-0 flex-1">

                                      <p className="truncate text-xs font-black">
                                        {
                                          card.name
                                        }
                                      </p>

                                      <p className="mt-1 text-[9px] text-[#888]">
                                        {
                                          card
                                            .set
                                            ?.name
                                        }
                                      </p>

                                    </div>


                                    <button
                                      type="button"
                                      onClick={() =>
                                        removeCardFromPack(
                                          card._id
                                        )
                                      }
                                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20"
                                    >
                                      <X
                                        size={14}
                                      />
                                    </button>

                                  </div>


                                  <div className="mt-3 grid grid-cols-2 gap-3">

                                    <div>

                                      <label className="text-[9px] font-black text-[#777]">
                                        PULL WEIGHT
                                      </label>

                                      <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={
                                          packCard.pullWeight
                                        }
                                        onChange={(e) =>
                                          updatePackCard(
                                            card._id,
                                            "pullWeight",
                                            e.target.value
                                          )
                                        }
                                        className="mt-1 h-9 w-full rounded-lg border border-black/10 px-3 text-xs font-bold outline-none focus:border-[#238bdc]"
                                      />

                                    </div>


                                    <div>

                                      <label className="text-[9px] font-black text-[#777]">
                                        QUANTITY
                                      </label>

                                      <input
                                        type="number"
                                        min="0"
                                        step="1"
                                        value={
                                          packCard.quantity
                                        }
                                        onChange={(e) =>
                                          updatePackCard(
                                            card._id,
                                            "quantity",
                                            e.target.value
                                          )
                                        }
                                        className="mt-1 h-9 w-full rounded-lg border border-black/10 px-3 text-xs font-bold outline-none focus:border-[#238bdc]"
                                      />

                                    </div>

                                  </div>

                                </div>

                              );
                            }
                          )

                        )}

                      </div>

                    </div>

                  </div>

                </div>


                {/* FOOTER */}

                <div className="mt-7 flex flex-col-reverse gap-3 border-t border-black/10 pt-5 sm:flex-row sm:justify-end">

                  <button
                    type="button"
                    onClick={() =>
                      setShowModal(
                        false
                      )
                    }
                    className="rounded-xl bg-black/5 px-5 py-3 text-xs font-black text-[#505258] hover:bg-black/10"
                  >
                    Cancel
                  </button>


                  <button
                    type="submit"
                    disabled={
                      saving
                    }
                    className="flex items-center justify-center gap-2 rounded-xl bg-[#238bdc] px-6 py-3 text-xs font-black text-white hover:bg-[#1678c4] disabled:opacity-50"
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

function StatusBadge({
  status,
}) {

  const styles = {
    DRAFT:
      "bg-yellow-500/10 text-yellow-600",

    PUBLISHED:
      "bg-green-500/10 text-green-600",

    PAUSED:
      "bg-orange-500/10 text-orange-600",

    ARCHIVED:
      "bg-red-500/10 text-red-500",
  };

  return (
    <span
      className={`rounded-full px-3 py-1.5 text-[9px] font-black ${
        styles[status] ||
        "bg-black/5 text-[#777]"
      }`}
    >
      {status}
    </span>
  );
}