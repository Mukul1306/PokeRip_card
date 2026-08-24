import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import {
  Search,
  CreditCard,
  Plus,
  Check,
  Trash2,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ImageOff,
  X,
} from "lucide-react";


const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";


export default function AdminCards() {

  const [search, setSearch] =
    useState("");

  const [searchResults, setSearchResults] =
    useState([]);

  const [savedCards, setSavedCards] =
    useState([]);

  const [loadingSearch, setLoadingSearch] =
    useState(false);

  const [loadingLibrary, setLoadingLibrary] =
    useState(false);

  const [addingId, setAddingId] =
    useState("");

  const [deletingId, setDeletingId] =
    useState("");

  const [activeTab, setActiveTab] =
    useState("search");

  const [page, setPage] =
    useState(1);

  const [libraryPage, setLibraryPage] =
    useState(1);

  const [searchPagination, setSearchPagination] =
    useState({
      page: 1,
      pageSize: 20,
      totalCount: 0,
      totalPages: 0,
    });

  const [libraryPagination, setLibraryPagination] =
    useState({
      page: 1,
      limit: 20,
      totalCards: 0,
      totalPages: 0,
    });


  // =====================================================
  // SEARCH API
  // =====================================================

  const searchCards = async (
    requestedPage = 1
  ) => {

    if (!search.trim()) {
      setSearchResults([]);
      return;
    }

    try {

      setLoadingSearch(true);

      const token =
        localStorage.getItem("adminToken");

      const params =
        new URLSearchParams({
          search:
            search.trim(),

          page:
            requestedPage,

          pageSize:
            20,
        });

      const response =
        await fetch(
          `${API_URL}/api/admin/cards/search?${params}`,
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
            "Search failed"
        );
      }

      setSearchResults(
        data.data?.cards || []
      );

      setSearchPagination(
        data.data?.pagination || {}
      );

      setPage(requestedPage);

    } catch (error) {

      console.error(
        "Card search error:",
        error
      );

      alert(error.message);

    } finally {

      setLoadingSearch(false);

    }
  };


  // =====================================================
  // SAVED LIBRARY
  // =====================================================

  const fetchSavedCards = async (
    requestedPage = 1
  ) => {

    try {

      setLoadingLibrary(true);

      const token =
        localStorage.getItem("adminToken");

      const params =
        new URLSearchParams({
          page:
            requestedPage,

          limit:
            20,
        });

      const response =
        await fetch(
          `${API_URL}/api/admin/cards?${params}`,
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

      setSavedCards(
        data.data?.cards || []
      );

      setLibraryPagination(
        data.data?.pagination || {}
      );

      setLibraryPage(
        requestedPage
      );

    } catch (error) {

      console.error(
        "Library error:",
        error
      );

      alert(error.message);

    } finally {

      setLoadingLibrary(false);

    }
  };


  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    fetchSavedCards();
  }, []);


  // =====================================================
  // ADD CARD
  // =====================================================

  const handleAddCard = async (
    card
  ) => {

    try {

      setAddingId(card.id);

      const token =
        localStorage.getItem("adminToken");

      const response =
        await fetch(
          `${API_URL}/api/admin/cards`,
          {
            method: "POST",

            headers: {
              Authorization:
                `Bearer ${token}`,

              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              tcgId: card.id,
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to add card"
        );
      }

      // Update search result
      setSearchResults(
        (current) =>
          current.map(
            (item) =>
              item.id === card.id
                ? {
                    ...item,
                    alreadyAdded:
                      true,
                  }
                : item
          )
      );

      // Refresh library
      fetchSavedCards(
        libraryPage
      );

    } catch (error) {

      console.error(
        "Add card error:",
        error
      );

      alert(error.message);

    } finally {

      setAddingId("");

    }
  };


  // =====================================================
  // DELETE CARD
  // =====================================================

  const handleDeleteCard = async (
    card
  ) => {

    const confirmed =
      window.confirm(
        `Remove ${card.name} from your card library?`
      );

    if (!confirmed) {
      return;
    }

    try {

      setDeletingId(
        card._id
      );

      const token =
        localStorage.getItem("adminToken");

      const response =
        await fetch(
          `${API_URL}/api/admin/cards/${card._id}`,
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
            "Unable to remove card"
        );
      }

      setSavedCards(
        (current) =>
          current.filter(
            (item) =>
              item._id !== card._id
          )
      );

    } catch (error) {

      console.error(
        "Delete card error:",
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

      <div>

        <p className="text-[10px] font-black tracking-[0.25em] text-[#238bdc]">
          CARD MANAGEMENT
        </p>

        <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
          Cards
        </h1>

        <p className="mt-2 text-sm text-[#505258]">
          Search real Pokémon TCG cards and build
          your PokeRip card library.
        </p>

      </div>


      {/* =================================================
          TABS
      ================================================= */}

      <div className="flex w-fit rounded-xl border border-black/10 bg-white/50 p-1">

        <button
          onClick={() =>
            setActiveTab("search")
          }
          className={`rounded-lg px-4 py-2 text-xs font-black transition ${
            activeTab === "search"
              ? "bg-[#238bdc] text-white shadow-sm"
              : "text-[#505258] hover:bg-black/5"
          }`}
        >
          Search Cards
        </button>

        <button
          onClick={() =>
            setActiveTab("library")
          }
          className={`rounded-lg px-4 py-2 text-xs font-black transition ${
            activeTab === "library"
              ? "bg-[#238bdc] text-white shadow-sm"
              : "text-[#505258] hover:bg-black/5"
          }`}
        >
          Card Library
        </button>

      </div>


      {/* =================================================
          SEARCH TAB
      ================================================= */}

      {activeTab === "search" && (

        <section className="space-y-5">

          <div className="relative">

            <Search
              size={17}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#777]"
            />

            <input
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              onKeyDown={(event) => {
                if (
                  event.key === "Enter"
                ) {
                  searchCards(1);
                }
              }}
              placeholder="Search Pokémon... e.g. Charizard"
              className="h-12 w-full rounded-xl border border-black/10 bg-white pl-11 pr-28 text-sm font-semibold text-[#101114] outline-none transition placeholder:text-[#999] focus:border-[#238bdc]"
            />

            <button
              onClick={() =>
                searchCards(1)
              }
              disabled={
                loadingSearch ||
                !search.trim()
              }
              className="absolute right-2 top-1/2 flex h-9 -translate-y-1/2 items-center gap-2 rounded-lg bg-[#238bdc] px-4 text-xs font-black text-white transition hover:bg-[#1678c4] disabled:cursor-not-allowed disabled:opacity-40"
            >

              {loadingSearch ? (
                <Loader2
                  size={14}
                  className="animate-spin"
                />
              ) : (
                <Search size={14} />
              )}

              Search

            </button>

          </div>


          {/* RESULTS */}

          {loadingSearch ? (

            <LoadingState />

          ) : searchResults.length === 0 ? (

            <EmptySearch />

          ) : (

            <>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

                <AnimatePresence>

                  {searchResults.map(
                    (card, index) => (

                      <CardSearchItem
                        key={card.id}
                        card={card}
                        index={index}
                        addingId={addingId}
                        onAdd={
                          handleAddCard
                        }
                      />

                    )
                  )}

                </AnimatePresence>

              </div>


              <Pagination
                page={
                  searchPagination.page
                }
                totalPages={
                  searchPagination.totalPages
                }
                onPrevious={() =>
                  searchCards(
                    page - 1
                  )
                }
                onNext={() =>
                  searchCards(
                    page + 1
                  )
                }
              />

            </>

          )}

        </section>

      )}


      {/* =================================================
          LIBRARY TAB
      ================================================= */}

      {activeTab === "library" && (

        <section className="space-y-5">

          {loadingLibrary ? (

            <LoadingState />

          ) : savedCards.length === 0 ? (

            <EmptyLibrary />

          ) : (

            <>

              <div className="overflow-hidden rounded-2xl border border-black/10 bg-white/50">

                <div className="border-b border-black/10 px-5 py-4">

                  <h2 className="text-sm font-black">
                    Saved Card Library
                  </h2>

                  <p className="mt-1 text-[10px] text-[#777]">
                    {libraryPagination.totalCards || 0}
                    {" "}cards available for future packs.
                  </p>

                </div>


                <div className="overflow-x-auto">

                  <table className="w-full min-w-[850px]">

                    <thead>

                      <tr className="border-b border-black/10 text-left">

                        <th className="px-5 py-4 text-[9px] font-black tracking-wider text-[#777]">
                          CARD
                        </th>

                        <th className="px-5 py-4 text-[9px] font-black tracking-wider text-[#777]">
                          SET
                        </th>

                        <th className="px-5 py-4 text-[9px] font-black tracking-wider text-[#777]">
                          NUMBER
                        </th>

                        <th className="px-5 py-4 text-[9px] font-black tracking-wider text-[#777]">
                          RARITY
                        </th>

                        <th className="px-5 py-4 text-right text-[9px] font-black tracking-wider text-[#777]">
                          ACTION
                        </th>

                      </tr>

                    </thead>


                    <tbody>

                      {savedCards.map(
                        (card) => (

                          <tr
                            key={
                              card._id
                            }
                            className="border-b border-black/5 transition hover:bg-black/[0.02]"
                          >

                            <td className="px-5 py-4">

                              <div className="flex items-center gap-3">
                                 {console.log("LIBRARY CARD:", card)}

                                
<img
  src={
    card.pokeWallet?.id
      ? `${API_URL}/api/admin/inventory/image/${card.pokeWallet.id}?size=low`
      : card.imageSmall ||
        card.imageLarge ||
        "https://via.placeholder.com/150x210?text=No+Image"
  }
  alt={card.name}
  className="h-16 w-12 rounded-lg object-cover shadow-sm"
  onError={(e) => {
    console.error("IMAGE FAILED:", e.currentTarget.src);
  }}
/>                                
                              
                                <div>

                                  <p className="text-xs font-black">
                                    {
                                      card.name
                                    }
                                  </p>

                                  <p className="mt-1 text-[9px] text-[#777]">
                                    {
                                      card.tcgId
                                    }
                                  </p>

                                </div>

                              </div>

                            </td>


                            <td className="px-5 py-4 text-xs font-semibold text-[#505258]">
                              {
                                card.set?.name
                              }
                            </td>


                            <td className="px-5 py-4 text-xs font-bold">
                              #{card.number}
                            </td>


                            <td className="px-5 py-4">

                              <span className="rounded-full bg-[#238bdc]/10 px-3 py-1.5 text-[9px] font-black text-[#238bdc]">
                                {
                                  card.rarity ||
                                  "Unknown"
                                }
                              </span>

                            </td>


                            <td className="px-5 py-4 text-right">

                              <button
                                onClick={() =>
                                  handleDeleteCard(
                                    card
                                  )
                                }
                                disabled={
                                  deletingId ===
                                  card._id
                                }
                                className="inline-flex items-center gap-2 rounded-lg bg-red-500/10 px-3 py-2 text-[10px] font-black text-red-500 transition hover:bg-red-500/20 disabled:opacity-40"
                              >

                                {deletingId ===
                                card._id ? (
                                  <Loader2
                                    size={13}
                                    className="animate-spin"
                                  />
                                ) : (
                                  <Trash2
                                    size={13}
                                  />
                                )}

                                Remove

                              </button>

                            </td>

                          </tr>

                        )
                      )}

                    </tbody>

                  </table>

                </div>

              </div>


              <Pagination
                page={
                  libraryPagination.page
                }
                totalPages={
                  libraryPagination.totalPages
                }
                onPrevious={() =>
                  fetchSavedCards(
                    libraryPage - 1
                  )
                }
                onNext={() =>
                  fetchSavedCards(
                    libraryPage + 1
                  )
                }
              />

            </>

          )}

        </section>

      )}

    </div>
  );
}


// =========================================================
// SEARCH CARD
// =========================================================

function CardSearchItem({
  card,
  index,
  addingId,
  onAdd,
}) {

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 15,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        delay: index * 0.04,
      }}
      className="overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
    >

      <div className="relative flex h-[310px] items-center justify-center bg-[#f4f4f4] p-4">

        {card.images?.large ? (

          <img
            src={card.images.large}
            alt={card.name}
            className="h-full w-full object-contain drop-shadow-xl"
          />

        ) : (

          <ImageOff
            size={30}
            className="text-[#aaa]"
          />

        )}


        {card.alreadyAdded && (

          <div className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-green-500 px-3 py-1.5 text-[9px] font-black text-white shadow">

            <Check size={12} />

            ADDED

          </div>

        )}

      </div>


      <div className="p-4">

        <h3 className="truncate text-sm font-black">
          {card.name}
        </h3>

        <p className="mt-1 truncate text-[10px] font-semibold text-[#777]">
          {card.set?.name}
        </p>

        <div className="mt-3 flex items-center justify-between">

          <div>

            <p className="text-[9px] font-bold text-[#999]">
              #{card.number}
            </p>

            <p className="text-[10px] font-bold text-[#505258]">
              {card.rarity ||
                "Unknown rarity"}
            </p>

          </div>


          <button
            onClick={() =>
              onAdd(card)
            }
            disabled={
              card.alreadyAdded ||
              addingId === card.id
            }
            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-[10px] font-black transition ${
              card.alreadyAdded
                ? "cursor-not-allowed bg-green-500/10 text-green-500"
                : "bg-[#238bdc] text-white hover:bg-[#1678c4]"
            }`}
          >

            {addingId === card.id ? (

              <Loader2
                size={13}
                className="animate-spin"
              />

            ) : card.alreadyAdded ? (

              <Check size={13} />

            ) : (

              <Plus size={13} />

            )}

            {card.alreadyAdded
              ? "Added"
              : "Add Card"}

          </button>

        </div>

      </div>

    </motion.div>
  );
}


// =========================================================
// LOADING
// =========================================================

function LoadingState() {

  return (
    <div className="flex min-h-[350px] items-center justify-center rounded-2xl border border-black/10 bg-white/40">

      <div className="flex flex-col items-center">

        <Loader2
          size={30}
          className="animate-spin text-[#238bdc]"
        />

        <p className="mt-3 text-xs font-bold text-[#777]">
          Fetching Pokémon cards...
        </p>

      </div>

    </div>
  );
}


// =========================================================
// EMPTY SEARCH
// =========================================================

function EmptySearch() {

  return (
    <div className="flex min-h-[350px] flex-col items-center justify-center rounded-2xl border border-black/10 bg-white/40">

      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#238bdc]/10">

        <CreditCard
          size={24}
          className="text-[#238bdc]"
        />

      </div>

      <h3 className="mt-4 text-sm font-black">
        Search for a card
      </h3>

      <p className="mt-1 text-xs text-[#777]">
        Search Charizard, Pikachu, Mewtwo...
      </p>

    </div>
  );
}


// =========================================================
// EMPTY LIBRARY
// =========================================================

function EmptyLibrary() {

  return (
    <div className="flex min-h-[350px] flex-col items-center justify-center rounded-2xl border border-black/10 bg-white/40">

      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-black/5">

        <CreditCard
          size={24}
          className="text-[#777]"
        />

      </div>

      <h3 className="mt-4 text-sm font-black">
        Your card library is empty
      </h3>

      <p className="mt-1 text-xs text-[#777]">
        Search the Pokémon TCG API and add cards.
      </p>

    </div>
  );
}


// =========================================================
// PAGINATION
// =========================================================

function Pagination({
  page,
  totalPages,
  onPrevious,
  onNext,
}) {

  if (!totalPages || totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex items-center justify-between">

      <p className="text-[10px] font-bold text-[#777]">
        Page {page} of {totalPages}
      </p>


      <div className="flex gap-2">

        <button
          onClick={onPrevious}
          disabled={page <= 1}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-black/10 bg-white transition hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-30"
        >
          <ChevronLeft size={15} />
        </button>


        <button
          onClick={onNext}
          disabled={
            page >= totalPages
          }
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-black/10 bg-white transition hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-30"
        >
          <ChevronRight size={15} />
        </button>

      </div>

    </div>
  );
}