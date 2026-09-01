
/* =====================================================
   SISTEM INVENTARIS RUANGAN
   JavaScript
===================================================== */


/* =====================================================
   CONFIGURATION
===================================================== */

const STORAGE_KEY = "inventaris_ruangan_data";
const THEME_KEY = "inventaris_theme";


/* =====================================================
   DOM ELEMENTS
===================================================== */

const inventoryForm = document.getElementById("inventoryForm");

const namaBarang = document.getElementById("namaBarang");
const kodeInventaris = document.getElementById("kodeInventaris");
const namaRuangan = document.getElementById("namaRuangan");
const jumlahBarang = document.getElementById("jumlahBarang");
const kondisiBarang = document.getElementById("kondisiBarang");

const editId = document.getElementById("editId");

const inventoryList = document.getElementById("inventoryList");
const emptyState = document.getElementById("emptyState");

const searchInput = document.getElementById("searchInput");
const roomFilter = document.getElementById("roomFilter");
const conditionFilter = document.getElementById("conditionFilter");

const totalBarang = document.getElementById("totalBarang");
const barangBaik = document.getElementById("barangBaik");
const barangRingan = document.getElementById("barangRingan");
const barangBerat = document.getElementById("barangBerat");

const chartTotal = document.getElementById("chartTotal");

const percentBaik = document.getElementById("percentBaik");
const percentRingan = document.getElementById("percentRingan");
const percentBerat = document.getElementById("percentBerat");

const chartCircle = document.getElementById("chartCircle");

const confirmModal = document.getElementById("confirmModal");
const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");
const cancelDeleteBtn = document.getElementById("cancelDeleteBtn");

const toast = document.getElementById("toast");
const toastMessage = document.getElementById("toastMessage");
const toastIcon = document.getElementById("toastIcon");

const darkModeBtn = document.getElementById("darkModeBtn");
const installBtn = document.getElementById("installBtn");

const mobileMenu = document.getElementById("mobileMenu");
const sidebar = document.getElementById("sidebar");

const pageTitle = document.getElementById("pageTitle");

const formTitle = document.getElementById("formTitle");
const submitText = document.getElementById("submitText");

const cancelEditBtn = document.getElementById("cancelEditBtn");

const addQuickBtn = document.getElementById("addQuickBtn");
const addInventoryBtn = document.getElementById("addInventoryBtn");
const emptyAddBtn = document.getElementById("emptyAddBtn");


/* =====================================================
   DATA
===================================================== */

let inventoryData = [];

let deleteTargetId = null;

let deferredPrompt = null;


/* =====================================================
   LOAD DATA
===================================================== */

function loadData() {

    try {

        const savedData =
            localStorage.getItem(STORAGE_KEY);

        if (savedData) {

            inventoryData = JSON.parse(savedData);

        } else {

            inventoryData = [];

        }

    } catch (error) {

        console.error(
            "Gagal membaca LocalStorage:",
            error
        );

        inventoryData = [];

    }

}


/* =====================================================
   SAVE DATA
===================================================== */

function saveData() {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(inventoryData)
    );

}


/* =====================================================
   INITIALIZATION
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadData();

        loadTheme();

        renderInventory();

        updateStatistics();

        updateRoomFilter();

        setupNavigation();

        registerServiceWorker();

    }
);


/* =====================================================
   ADD / EDIT DATA
===================================================== */

inventoryForm.addEventListener(
    "submit",
    function (event) {

        event.preventDefault();

        const name =
            namaBarang.value.trim();

        const code =
            kodeInventaris.value.trim();

        const room =
            namaRuangan.value.trim();

        const quantity =
            Number(jumlahBarang.value);

        const condition =
            kondisiBarang.value;


        /* VALIDATION */

        if (!name || !code || !room || !quantity || !condition) {

            showToast(
                "Harap lengkapi semua data.",
                "error"
            );

            return;

        }


        if (quantity < 1) {

            showToast(
                "Jumlah barang minimal 1.",
                "error"
            );

            return;

        }


        /* EDIT */

        if (editId.value) {

            const id = editId.value;

            const index =
                inventoryData.findIndex(
                    item => item.id === id
                );


            if (index !== -1) {

                inventoryData[index] = {

                    ...inventoryData[index],

                    name,
                    code,
                    room,
                    quantity,
                    condition

                };

                showToast(
                    "Data berhasil diperbarui."
                );

            }

        }

        /* ADD */

        else {

            const duplicate =
                inventoryData.some(
                    item =>
                        item.code.toLowerCase() ===
                        code.toLowerCase()
                );


            if (duplicate) {

                showToast(
                    "Kode inventaris sudah digunakan.",
                    "error"
                );

                return;

            }


            const newItem = {

                id:
                    Date.now().toString(),

                name,

                code,

                room,

                quantity,

                condition,

                createdAt:
                    new Date().toISOString()

            };


            inventoryData.unshift(newItem);


            showToast(
                "Barang berhasil ditambahkan."
            );

        }


        saveData();

        resetForm();

        renderInventory();

        updateStatistics();

        updateRoomFilter();

        scrollToInventory();

    }
);


/* =====================================================
   RENDER INVENTORY
===================================================== */

function renderInventory() {

    const search =
        searchInput.value
            .toLowerCase()
            .trim();

    const room =
        roomFilter.value;

    const condition =
        conditionFilter.value;


    const filteredData =
        inventoryData.filter(item => {

            const matchesSearch =
                item.name
                    .toLowerCase()
                    .includes(search)

                ||

                item.code
                    .toLowerCase()
                    .includes(search);


            const matchesRoom =
                room === "all"
                ||
                item.room === room;


            const matchesCondition =
                condition === "all"
                ||
                item.condition === condition;


            return (
                matchesSearch &&
                matchesRoom &&
                matchesCondition
            );

        });


    inventoryList.innerHTML = "";


    if (filteredData.length === 0) {

        inventoryList.classList.add("hidden");

        emptyState.classList.remove("hidden");

        return;

    }


    inventoryList.classList.remove("hidden");

    emptyState.classList.add("hidden");


    filteredData.forEach(item => {

        inventoryList.appendChild(
            createInventoryCard(item)
        );

    });

}


/* =====================================================
   CREATE INVENTORY CARD
===================================================== */

function createInventoryCard(item) {

    const card =
        document.createElement("article");

    card.className =
        "inventory-card";


    let conditionClass = "";

    if (item.condition === "Baik") {

        conditionClass = "baik";

    } else if (item.condition === "Rusak Ringan") {

        conditionClass = "ringan";

    } else {

        conditionClass = "berat";

    }


    card.innerHTML = `

        <div class="card-top">

            <div class="card-icon">
                <i class="fa-solid fa-box"></i>
            </div>

            <span class="condition ${conditionClass}">
                ${escapeHTML(item.condition)}
            </span>

        </div>


        <h3>
            ${escapeHTML(item.name)}
        </h3>

        <p class="code">
            ${escapeHTML(item.code)}
        </p>


        <div class="card-details">

            <div class="detail-row">

                <span>
                    <i class="fa-solid fa-door-open"></i>
                    Ruangan
                </span>

                <strong>
                    ${escapeHTML(item.room)}
                </strong>

            </div>


            <div class="detail-row">

                <span>
                    <i class="fa-solid fa-boxes-stacked"></i>
                    Jumlah
                </span>

                <strong>
                    ${item.quantity}
                </strong>

            </div>

        </div>


        <div class="card-actions">

            <button
                class="edit-btn"
                data-id="${item.id}"
            >
                <i class="fa-solid fa-pen"></i>
                Edit
            </button>


            <button
                class="delete-btn"
                data-id="${item.id}"
            >
                <i class="fa-solid fa-trash"></i>
                Hapus
            </button>

        </div>

    `;


    const editButton =
        card.querySelector(".edit-btn");

    const deleteButton =
        card.querySelector(".delete-btn");


    editButton.addEventListener(
        "click",
        () => editInventory(item.id)
    );


    deleteButton.addEventListener(
        "click",
        () => openDeleteModal(item.id)
    );


    return card;

}


/* =====================================================
   EDIT INVENTORY
===================================================== */

function editInventory(id) {

    const item =
        inventoryData.find(
            item => item.id === id
        );


    if (!item) {

        showToast(
            "Data tidak ditemukan.",
            "error"
        );

        return;

    }


    editId.value = item.id;

    namaBarang.value = item.name;

    kodeInventaris.value = item.code;

    namaRuangan.value = item.room;

    jumlahBarang.value = item.quantity;

    kondisiBarang.value = item.condition;


    formTitle.textContent =
        "Edit Inventaris";

    submitText.textContent =
        "Update Barang";


    kodeInventaris.disabled = true;


    document
        .getElementById("tambah")
        .scrollIntoView({
            behavior: "smooth"
        });

}


/* =====================================================
   RESET FORM
===================================================== */

function resetForm() {

    inventoryForm.reset();

    editId.value = "";

    formTitle.textContent =
        "Tambah Inventaris";

    submitText.textContent =
        "Simpan Barang";

    kodeInventaris.disabled = false;

}


/* =====================================================
   CANCEL EDIT
===================================================== */

cancelEditBtn.addEventListener(
    "click",
    resetForm
);


/* =====================================================
   DELETE MODAL
===================================================== */

function openDeleteModal(id) {

    deleteTargetId = id;

    confirmModal.classList.remove("hidden");

}


cancelDeleteBtn.addEventListener(
    "click",
    closeDeleteModal
);


function closeDeleteModal() {

    confirmModal.classList.add("hidden");

    deleteTargetId = null;

}


/* =====================================================
   CONFIRM DELETE
===================================================== */

confirmDeleteBtn.addEventListener(
    "click",
    () => {

        if (!deleteTargetId) {

            return;

        }


        inventoryData =
            inventoryData.filter(
                item =>
                    item.id !== deleteTargetId
            );


        saveData();

        renderInventory();

        updateStatistics();

        updateRoomFilter();

        closeDeleteModal();


        showToast(
            "Data berhasil dihapus."
        );

    }
);


/* =====================================================
   DELETE ALL
===================================================== */

document
    .getElementById("deleteAllBtn")
    .addEventListener(
        "click",
        () => {

            if (inventoryData.length === 0) {

                showToast(
                    "Tidak ada data untuk dihapus.",
                    "error"
                );

                return;

            }


            const confirmation =
                confirm(
                    "Apakah Anda yakin ingin menghapus SEMUA data inventaris?"
                );


            if (!confirmation) {

                return;

            }


            inventoryData = [];

            saveData();

            renderInventory();

            updateStatistics();

            updateRoomFilter();


            showToast(
                "Semua data berhasil dihapus."
            );

        }
    );


/* =====================================================
   SEARCH
===================================================== */

searchInput.addEventListener(
    "input",
    renderInventory
);


/* =====================================================
   FILTER
===================================================== */

roomFilter.addEventListener(
    "change",
    renderInventory
);

conditionFilter.addEventListener(
    "change",
    renderInventory
);


/* =====================================================
   UPDATE ROOM FILTER
===================================================== */

function updateRoomFilter() {

    const currentValue =
        roomFilter.value;


    const rooms =
        [...new Set(
            inventoryData.map(
                item => item.room
            )
        )].sort();


    roomFilter.innerHTML =
        `<option value="all">
            Semua Ruangan
        </option>`;


    rooms.forEach(room => {

        const option =
            document.createElement("option");

        option.value = room;

        option.textContent = room;

        roomFilter.appendChild(option);

    });


    if (
        rooms.includes(currentValue)
    ) {

        roomFilter.value =
            currentValue;

    }

}


/* =====================================================
   STATISTICS
===================================================== */

function updateStatistics() {

    let total = 0;

    let good = 0;

    let light = 0;

    let heavy = 0;


    inventoryData.forEach(item => {

        const quantity =
            Number(item.quantity) || 0;


        total += quantity;


        if (item.condition === "Baik") {

            good += quantity;

        }

        else if (
            item.condition ===
            "Rusak Ringan"
        ) {

            light += quantity;

        }

        else if (
            item.condition ===
            "Rusak Berat"
        ) {

            heavy += quantity;

        }

    });


    totalBarang.textContent =
        total;

    barangBaik.textContent =
        good;

    barangRingan.textContent =
        light;

    barangBerat.textContent =
        heavy;


    chartTotal.textContent =
        total;


    let goodPercent = 0;

    let lightPercent = 0;

    let heavyPercent = 0;


    if (total > 0) {

        goodPercent =
            Math.round(
                (good / total) * 100
            );

        lightPercent =
            Math.round(
                (light / total) * 100
            );

        heavyPercent =
            100 -
            goodPercent -
            lightPercent;

    }


    percentBaik.textContent =
        `${goodPercent}%`;

    percentRingan.textContent =
        `${lightPercent}%`;

    percentBerat.textContent =
        `${heavyPercent}%`;


    const goodDegree =
        goodPercent * 3.6;

    const lightDegree =
        lightPercent * 3.6;


    const secondDegree =
        goodDegree + lightDegree;


    chartCircle.style.background =
        `
        conic-gradient(
            var(--green) 0deg ${goodDegree}deg,
            var(--orange) ${goodDegree}deg ${secondDegree}deg,
            var(--red) ${secondDegree}deg 360deg
        )
        `;

}


/* =====================================================
   TOAST
===================================================== */

let toastTimer;


function showToast(
    message,
    type = "success"
) {

    clearTimeout(toastTimer);


    toastMessage.textContent =
        message;


    toast.className =
        `toast show ${type}`;


    if (type === "error") {

        toastIcon.className =
            "fa-solid fa-circle-exclamation";

    } else {

        toastIcon.className =
            "fa-solid fa-circle-check";

    }


    toastTimer =
        setTimeout(
            () => {

                toast.classList.remove(
                    "show"
                );

            },
            3000
        );

}


/* =====================================================
   DARK MODE
===================================================== */

function loadTheme() {

    const theme =
        localStorage.getItem(
            THEME_KEY
        );


    if (theme === "dark") {

        document.body.classList.add(
            "dark"
        );

        updateDarkModeButton(true);

    } else {

        updateDarkModeButton(false);

    }

}


function toggleDarkMode() {

    const isDark =
        document.body.classList.toggle(
            "dark"
        );


    localStorage.setItem(
        THEME_KEY,
        isDark ? "dark" : "light"
    );


    updateDarkModeButton(isDark);

}


function updateDarkModeButton(isDark) {

    if (isDark) {

        darkModeBtn.innerHTML =
            `
            <i class="fa-solid fa-sun"></i>
            <span>Light Mode</span>
            `;

    } else {

        darkModeBtn.innerHTML =
            `
            <i class="fa-solid fa-moon"></i>
            <span>Dark Mode</span>
            `;

    }

}


darkModeBtn.addEventListener(
    "click",
    toggleDarkMode
);


/* =====================================================
   NAVIGATION
===================================================== */

function setupNavigation() {

    const links =
        document.querySelectorAll(
            ".menu-link"
        );


    links.forEach(link => {

        link.addEventListener(
            "click",
            () => {

                links.forEach(
                    item =>
                        item.classList.remove(
                            "active"
                        )
                );


                link.classList.add(
                    "active"
                );


                const target =
                    link.getAttribute(
                        "href"
                    );


                if (target === "#dashboard") {

                    pageTitle.textContent =
                        "Dashboard";

                }

                else if (
                    target === "#inventaris"
                ) {

                    pageTitle.textContent =
                        "Daftar Inventaris";

                }

                else if (
                    target === "#tambah"
                ) {

                    pageTitle.textContent =
                        "Tambah Barang";

                }


                sidebar.classList.remove(
                    "open"
                );

            }
        );

    });

}


/* =====================================================
   QUICK ADD BUTTON
===================================================== */

function goToAddForm() {

    resetForm();

    document
        .getElementById("tambah")
        .scrollIntoView({
            behavior: "smooth"
        });

}


addQuickBtn.addEventListener(
    "click",
    goToAddForm
);


addInventoryBtn.addEventListener(
    "click",
    goToAddForm
);


emptyAddBtn.addEventListener(
    "click",
    goToAddForm
);


/* =====================================================
   MOBILE MENU
===================================================== */

mobileMenu.addEventListener(
    "click",
    () => {

        sidebar.classList.toggle(
            "open"
        );

    }
);


/* =====================================================
   SCROLL INVENTORY
===================================================== */

function scrollToInventory() {

    document
        .getElementById("inventaris")
        .scrollIntoView({
            behavior: "smooth"
        });

}


/* =====================================================
   EXPORT DATA
===================================================== */

document
    .getElementById("exportBtn")
    .addEventListener(
        "click",
        () => {

            if (inventoryData.length === 0) {

                showToast(
                    "Tidak ada data untuk diexport.",
                    "error"
                );

                return;

            }


            const data =
                JSON.stringify(
                    inventoryData,
                    null,
                    2
                );


            downloadFile(
                data,
                "inventaris.json",
                "application/json"
            );


            showToast(
                "Data berhasil diexport."
            );

        }
    );


/* =====================================================
   BACKUP
===================================================== */

document
    .getElementById("backupBtn")
    .addEventListener(
        "click",
        () => {

            const backup = {

                version: "1.0",

                createdAt:
                    new Date().toISOString(),

                data:
                    inventoryData

            };


            downloadFile(
                JSON.stringify(
                    backup,
                    null,
                    2
                ),
                "backup-inventaris.json",
                "application/json"
            );


            showToast(
                "Backup berhasil dibuat."
            );

        }
    );


/* =====================================================
   IMPORT DATA
===================================================== */

document
    .getElementById("importInput")
    .addEventListener(
        "change",
        function () {

            const file =
                this.files[0];


            if (!file) {

                return;

            }


            const reader =
                new FileReader();


            reader.onload =
                function (event) {

                    try {

                        const imported =
                            JSON.parse(
                                event.target.result
                            );


                        if (
                            !Array.isArray(
                                imported
                            )
                        ) {

                            throw new Error(
                                "Format tidak valid"
                            );

                        }


                        inventoryData =
                            imported;


                        saveData();

                        renderInventory();

                        updateStatistics();

                        updateRoomFilter();


                        showToast(
                            "Data berhasil diimport."
                        );


                    } catch (error) {

                        showToast(
                            "File import tidak valid.",
                            "error"
                        );

                    }

                };


            reader.readAsText(file);

            this.value = "";

        }
    );


/* =====================================================
   RESTORE BACKUP
===================================================== */

document
    .getElementById("restoreInput")
    .addEventListener(
        "change",
        function () {

            const file =
                this.files[0];


            if (!file) {

                return;

            }


            const reader =
                new FileReader();


            reader.onload =
                function (event) {

                    try {

                        const backup =
                            JSON.parse(
                                event.target.result
                            );


                        if (
                            !backup.data
                            ||
                            !Array.isArray(
                                backup.data
                            )
                        ) {

                            throw new Error(
                                "Backup tidak valid"
                            );

                        }


                        const confirmation =
                            confirm(
                                "Restore backup akan mengganti data saat ini. Lanjutkan?"
                            );


                        if (!confirmation) {

                            return;

                        }


                        inventoryData =
                            backup.data;


                        saveData();

                        renderInventory();

                        updateStatistics();

                        updateRoomFilter();


                        showToast(
                            "Backup berhasil direstore."
                        );


                    } catch (error) {

                        showToast(
                            "File backup tidak valid.",
                            "error"
                        );

                    }

                };


            reader.readAsText(file);

            this.value = "";

        }
    );


/* =====================================================
   DOWNLOAD FILE
===================================================== */

function downloadFile(
    content,
    filename,
    type
) {

    const blob =
        new Blob(
            [content],
            {
                type
            }
        );


    const url =
        URL.createObjectURL(blob);


    const link =
        document.createElement("a");


    link.href = url;

    link.download = filename;


    document.body.appendChild(link);

    link.click();

    link.remove();


    URL.revokeObjectURL(url);

}


/* =====================================================
   ESCAPE HTML
   Mencegah HTML dimasukkan ke dalam data.
===================================================== */

function escapeHTML(value) {

    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


/* =====================================================
   PWA INSTALL
===================================================== */

window.addEventListener(
    "beforeinstallprompt",
    event => {

        event.preventDefault();

        deferredPrompt = event;

        installBtn.classList.remove(
            "hidden"
        );

    }
);


installBtn.addEventListener(
    "click",
    async () => {

        if (!deferredPrompt) {

            showToast(
                "Aplikasi belum dapat di-install.",
                "error"
            );

            return;

        }


        deferredPrompt.prompt();


        const result =
            await deferredPrompt.userChoice;


        if (
            result.outcome === "accepted"
        ) {

            showToast(
                "Aplikasi berhasil di-install."
            );

        }


        deferredPrompt = null;

        installBtn.classList.add(
            "hidden"
        );

    }
);


window.addEventListener(
    "appinstalled",
    () => {

        installBtn.classList.add(
            "hidden"
        );

        deferredPrompt = null;

    }
);


/* =====================================================
   SERVICE WORKER
===================================================== */

function registerServiceWorker() {

    if (
        "serviceWorker" in navigator
    ) {

        window.addEventListener(
            "load",
            () => {

                navigator.serviceWorker
                    .register(
                        "service-worker.js"
                    )
                    .then(
                        registration => {

                            console.log(
                                "Service Worker aktif:",
                                registration.scope
                            );

                        }
                    )
                    .catch(
                        error => {

                            console.error(
                                "Service Worker gagal:",
                                error
                            );

                        }
                    );

            }
        );

    }

}


/* =====================================================
   KEYBOARD ESCAPE
===================================================== */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Escape"
        ) {

            closeDeleteModal();

        }

    }
);


/* =====================================================
   CLICK OUTSIDE MODAL
===================================================== */

confirmModal.addEventListener(
    "click",
    event => {

        if (
            event.target === confirmModal
        ) {

            closeDeleteModal();

        }

    }
);

