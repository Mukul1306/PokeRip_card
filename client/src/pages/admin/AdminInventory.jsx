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

  const [scanFile, setScanFile] = useState(null);
  const [scanning, setScanning] = useState(false);

  // =====================================================
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
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    fetchInventory();
    fetchSummary();
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
  // SCAN CARD
  // =====================================================

  const scanCard = async () => {
    if (!scanFile) {
      alert("Please select a card image first.");
      return;
    }

    try {
      setScanning(true);

      const token = getToken();

      const formData = new FormData();

      formData.append(
        "cardImage",
        scanFile
      );

      const response = await fetch(
        `${API_URL}/api/admin/inventory/scan`,
        {
          method: "POST",

          headers: {
            Authorization: `Bearer ${token}`,
          },

          body: formData,
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Unable to scan card"
        );
      }

      alert(
        result.message ||
          "Card scanned successfully"
      );

      setScanFile(null);

      // Reset file input
      const input =
        document.getElementById(
          "cardScanner"
        );

      if (input) {
        input.value = "";
      }

      await refreshInventory();

    } catch (error) {
      console.error(
        "Scan card error:",
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

        <button
          onClick={refreshInventory}
          className="flex items-center justify-center gap-2 rounded-xl bg-black px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-800"
        >
          <RefreshCw size={17} />
          Refresh
        </button>

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


      {/* =================================================
          SCAN CARD
      ================================================= */}

      <div className="rounded-2xl bg-white p-6 shadow-sm">

        <div className="mb-4 flex items-center gap-3">

          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black text-white">
            <ScanLine size={20} />
          </div>

          <div>
            <h2 className="font-bold">
              Scan Physical Card
            </h2>

            <p className="text-sm text-gray-500">
              Upload a photo of the card to identify it automatically.
            </p>
          </div>

        </div>


        <div className="flex flex-col gap-3 md:flex-row md:items-center">

          <input
            id="cardScanner"
            type="file"
            accept="image/*"
            capture="environment"
            onChange={(e) =>
              setScanFile(
                e.target.files?.[0] || null
              )
            }
            className="block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm"
          />

          <button
            onClick={scanCard}
            disabled={
              !scanFile || scanning
            }
            className="flex min-w-[150px] items-center justify-center gap-2 rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ScanLine size={18} />

            {scanning
              ? "Scanning..."
              : "Scan Card"}
          </button>

        </div>

        <p className="mt-3 text-xs text-gray-400">
          The scanned card will be searched using the PokéWallet API.
If it does not already exist in your inventory, it will be added automatically.
        </p>

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
          TABLE
      ================================================= */}

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm">

        <div className="overflow-x-auto">

          <table className="w-full min-w-[950px]">

            <thead className="border-b bg-gray-50">

              <tr className="text-left text-xs uppercase tracking-wide text-gray-500">

                <th className="px-6 py-4">
                  Card
                </th>

                <th className="px-6 py-4">
                  Set
                </th>

                <th className="px-6 py-4">
                  Number
                </th>

                <th className="px-6 py-4">
                  Rarity
                </th>

                <th className="px-6 py-4">
                  Available
                </th>

                <th className="px-6 py-4">
                  Reserved
                </th>

                <th className="px-6 py-4">
                  Consumed
                </th>

                <th className="px-6 py-4 text-right">
                  Actions
                </th>

              </tr>

            </thead>


            <tbody className="divide-y">

              {loading ? (

                <tr>

                  <td
                    colSpan="8"
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    Loading inventory...
                  </td>

                </tr>

              ) : inventory.length === 0 ? (

                <tr>

                  <td
                    colSpan="8"
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    No inventory found.
                  </td>

                </tr>

              ) : (

                inventory.map((item) => {

                  const card =
                    item.card || {};

                  return (

                    <tr
                      key={item._id}
                      className="hover:bg-gray-50"
                    >

                      {/* CARD */}

                      <td className="px-6 py-4">

                        <div className="flex items-center gap-4">

                          <div className="h-16 w-12 overflow-hidden rounded-lg bg-gray-100">

                            {getImage(card) ? (

                              <img
                                src={getImage(card)}
                                alt={
                                  card.name ||
                                  "Card"
                                }
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
                              {card.name ||
                                "Unknown Card"}
                            </p>

                            <p className="mt-1 text-xs text-gray-400">
                              #{card.number || "-"}
                            </p>

                          </div>

                        </div>

                      </td>


                      {/* SET */}

                      <td className="px-6 py-4 text-sm">

                        {getSetName(
                          card.set
                        )}

                      </td>


                      {/* NUMBER */}

                      <td className="px-6 py-4 text-sm">

                        {card.number ||
                          "-"}

                      </td>


                      {/* RARITY */}

                      <td className="px-6 py-4 text-sm">

                        {card.rarity ||
                          "-"}

                      </td>


                      {/* AVAILABLE */}

                      <td className="px-6 py-4">

                        <span className="rounded-lg bg-green-100 px-3 py-1.5 text-sm font-semibold text-green-700">
                          {item.available ??
                            0}
                        </span>

                      </td>


                      {/* RESERVED */}

                      <td className="px-6 py-4 text-sm">

                        {item.reserved ??
                          0}

                      </td>


                      {/* CONSUMED */}

                      <td className="px-6 py-4 text-sm">

                        {item.consumed ??
                          0}

                      </td>


                      {/* ACTIONS */}

                      <td className="px-6 py-4">

                        <div className="flex justify-end gap-2">

                          <button
                            onClick={() => {
                              setEditingCard(
                                item
                              );

                              setQuantity(
                                item.available ??
                                  0
                              );
                            }}
                            className="rounded-lg border border-gray-200 p-2 hover:bg-gray-100"
                            title="Update quantity"
                          >
                            <Edit
                              size={17}
                            />
                          </button>


                          <button
                            onClick={() =>
                              deleteInventory(
                                card._id
                              )
                            }
                            className="rounded-lg border border-red-200 p-2 text-red-600 hover:bg-red-50"
                            title="Delete inventory"
                          >
                            <Trash2
                              size={17}
                            />
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