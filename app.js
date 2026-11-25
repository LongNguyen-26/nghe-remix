"use strict";

const products = [
  {
    id: "go-hoi-an",
    mode: "preorder",
    name: "Gốm Hội An đương đại",
    image: "assets/ceramics.webp",
    alt: "Chén gốm Thanh Hà vẽ mái ngói phố Hội",
    summary: "Bộ chén đất nung lấy cảm hứng từ mái ngói phố Hội.",
    description: "Từ phác thảo phố cổ, nét mái ngói và đường cong sông Hoài được giản lược để vẽ tay trên gốm đất nung. Mẫu thử gồm ba chén và một đĩa nhỏ.",
    price: 450000,
    deposit: 90000,
    initial: 8,
    minimum: 12,
    limit: 30
  },
  {
    id: "khay-tre",
    mode: "buy",
    name: "Khay tre đan",
    image: "assets/weaving.webp",
    alt: "Khay tre đan tròn có viền tết",
    summary: "Khay tròn với viền tết tay, dùng để đựng trà và bánh.",
    description: "Nan tre nhỏ đan chéo tạo mặt khay phẳng, vành được bện tay. Mẫu có đường kính khoảng 25 cm và đi kèm hướng dẫn giữ khô sau khi sử dụng.",
    price: 285000,
    limit: 6
  },
  {
    id: "goc-pho",
    mode: "commission",
    name: "Gốm vẽ theo yêu cầu",
    image: "assets/commission.webp",
    alt: "Một đĩa gốm vẽ tay với cọ và màu vẽ",
    summary: "Chọn câu chuyện hoặc họa tiết để đề xuất một mẫu riêng.",
    description: "Phác thảo một họa tiết từ góc phố, ký ức hoặc dịp tặng quà của bạn. Nghệ nhân thẩm định bề mặt, màu và thời gian chế tác trước khi chốt báo giá."
  }
];

const modes = {
  buy: { label: "Mua ngay", action: "Thêm vào giỏ" },
  commission: { label: "Đặt chế tác", action: "Gửi yêu cầu chế tác" },
  preorder: { label: "Đặt trước", action: "Thử đặt trước" }
};

const profiles = {
  art: {
    label: "Art Gallery · Tác phẩm minh họa",
    title: "Mái ngói phố Hội",
    image: "assets/art.webp",
    alt: "Bản minh họa màu nước về kiến trúc Hội An",
    text: "Bộ phác thảo khai thác sắc tường vàng, mái ngói và nhịp nhà ven sông. Nét phác có thể chuyển thể sang gốm sau khi thống nhất kỹ thuật và quyền sử dụng tác phẩm.",
    action: "Đề xuất chuyển thể"
  },
  artisan: {
    label: "Artisan Shop · Hồ sơ minh họa",
    title: "Xưởng tre đan",
    image: "assets/weaving.webp",
    alt: "Khay tre đan thủ công",
    text: "Hồ sơ mẫu giới thiệu kỹ thuật lên nan, đan mắt chéo và bện viền. Xưởng có thể thẩm định ý tưởng khay, giỏ và mẫu trang trí theo kích thước dự kiến.",
    action: "Đề xuất hợp tác với xưởng"
  }
};

const steps = [
  {
    actors: "Người sáng tạo × nghệ nhân",
    title: "Chọn nét vẽ và chất liệu",
    description: "Người minh họa đưa bản vẽ phố Hội lên Art Gallery. Nghệ nhân gốm đề xuất chuyển những đường mái ngói lên bề mặt đất nung."
  },
  {
    actors: "Nghệ nhân × Nghề Remix",
    title: "Thẩm định thiết kế và chi phí",
    description: "Nghệ nhân kiểm tra họa tiết có thể vẽ trên gốm hay không. Các bên thống nhất mẫu, chi phí, phạm vi sử dụng tác phẩm và thù lao."
  },
  {
    actors: "Nghệ nhân × người sáng tạo",
    title: "Cùng duyệt nguyên mẫu",
    description: "Xưởng làm mẫu thử. Người sáng tạo và nghệ nhân duyệt màu, nét và công năng. Đội giới thiệu ảnh mẫu và lấy phản hồi từ khách hàng."
  },
  {
    actors: "Nghề Remix × người mua",
    title: "Mở đặt trước và chốt lô",
    description: "Đội công bố giá, mức cọc, ngưỡng đơn và lịch giao. Khi đủ điều kiện, xưởng nhận lô sản xuất, đội kiểm hàng và đối soát quyền lợi."
  }
];

const roles = ["Người sáng tạo", "Nghệ nhân hoặc cơ sở chế tác", "Khách hàng cá nhân", "Doanh nghiệp"];
const preorderProduct = products[0];
const buyProduct = products[1];
const storageKey = "nghe-remix-prototype-v1";
const currency = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" });
const dialog = document.querySelector("#dialog");
const dialogContent = document.querySelector("#dialog-content");
const productGrid = document.querySelector("#product-grid");
let dialogTrigger;

function countWithin(value, maximum) {
  return Number.isInteger(value) && value > 0 ? Math.min(value, maximum) : 0;
}

function readState() {
  try {
    const data = JSON.parse(localStorage.getItem(storageKey)) || {};
    return {
      cart: countWithin(data.cart, buyProduct.limit),
      preorders: countWithin(data.preorders, preorderProduct.limit - preorderProduct.initial)
    };
  } catch {
    return { cart: 0, preorders: 0 };
  }
}

const state = readState();

function saveState() {
  try {
    localStorage.setItem(storageKey, JSON.stringify(state));
  } catch {
    // In-memory state still works when storage is unavailable.
  }
}

function reserved() {
  return preorderProduct.initial + state.preorders;
}

function refreshCounters() {
  document.querySelector("#cart-count").textContent = state.cart || "";
  document.querySelector("[data-cart]").setAttribute("aria-label", "Giỏ hàng, " + state.cart + " sản phẩm");
  document.querySelector("#preorder-count").textContent = reserved();
  document.querySelector("#preorder-progress").value = reserved();
}

function renderProducts(mode = "all") {
  const visible = products.filter(product => mode === "all" || product.mode === mode);
  productGrid.innerHTML = visible.map(product => [
    '<article class="product">',
    '<img src="' + product.image + '" alt="' + product.alt + '" width="1024" height="768" loading="lazy">',
    '<div class="product-copy">',
    '<p class="eyebrow">' + modes[product.mode].label + '</p>',
    '<h3>' + product.name + '</h3>',
    '<p class="product-description">' + product.summary + '</p>',
    '<div class="product-footer"><strong>' + (product.price ? currency.format(product.price) : "Báo giá theo mẫu") + '</strong>',
    '<button class="text-link" type="button" data-product="' + product.id + '" aria-label="Xem ' + product.name + '">Chi tiết</button></div>',
    '</div></article>'
  ].join("")).join("");
  document.querySelector("#filter-result").textContent = "Đang hiển thị " + visible.length + " sản phẩm.";
  document.querySelectorAll("[data-filter]").forEach(button => {
    button.setAttribute("aria-pressed", button.dataset.filter === mode);
  });
}

function openDialog(markup) {
  if (!dialog.open) {
    dialogTrigger = document.activeElement;
  }
  dialogContent.innerHTML = markup;
  if (!dialog.open) {
    dialog.showModal();
  }
  dialog.scrollTop = 0;
  const heading = dialogContent.querySelector("h2");
  heading.tabIndex = -1;
  heading.focus({ preventScroll: true });
}

function titleBlock(label, title, description) {
  return '<p class="eyebrow">' + label + '</p><h2 id="dialog-title">' + title + '</h2>' +
    (description ? "<p>" + description + "</p>" : "");
}

function success(title, description) {
  openDialog(titleBlock("Bản thử nghiệm", title, description) +
    '<div class="dialog-actions"><button type="button" class="button dark" data-close>Tiếp tục khám phá</button></div>');
}

function showProduct(product) {
  const image = '<img src="' + product.image + '" alt="' + product.alt + '">';
  const detail = titleBlock(modes[product.mode].label, product.name) + image + "<p>" + product.description + "</p>";

  if (product.mode === "commission") {
    openDialog(detail + '<p class="notice">Đội sẽ cần xem yêu cầu để xác định mẫu, giá và thời gian chế tác.</p>' +
      '<div class="dialog-actions"><button class="button clay" type="button" data-commission>' +
      modes.commission.action + '</button></div>');
    return;
  }

  if (product.mode === "preorder") {
    const remaining = product.limit - reserved();
    const terms = '<p><strong>' + currency.format(product.price) + '</strong> mỗi bộ · Cọc minh họa ' +
      currency.format(product.deposit) + '</p><p>' + reserved() + '/' + product.minimum +
      ' đơn để chốt lô · Giới hạn ' + product.limit + ' bộ</p>' +
      '<p class="notice">Giả định lô được chốt khi đủ ' + product.minimum + ' đơn. Nếu không đạt ngưỡng, tiền cọc được hoàn theo điều kiện công bố. Bản thử sử dụng dữ liệu mô phỏng.</p>';
    const order = remaining > 0
      ? '<form data-preorder-form><label class="quantity-label">Số bộ<input name="quantity" type="number" min="1" max="' +
        remaining + '" value="1" required></label><div class="dialog-actions"><button class="button clay" type="submit">Xác nhận đặt trước thử</button></div></form>'
      : '<p><strong>Đã đủ số lượng phiên bản thử nghiệm.</strong></p>';
    openDialog(detail + terms + order);
    return;
  }

  openDialog(detail + '<p><strong>' + currency.format(product.price) + '</strong> mỗi khay</p>' +
    '<p class="notice">Có ' + product.limit + ' khay trong danh mục mô phỏng.</p>' +
    '<div class="dialog-actions"><button class="button clay" type="button" data-add>' + modes.buy.action +
    '</button><button type="button" class="button outline" data-cart>Xem giỏ hàng</button></div>');
}

function showProfile(key) {
  const profile = profiles[key];
  openDialog(titleBlock(profile.label, profile.title) +
    '<img src="' + profile.image + '" alt="' + profile.alt + '">' +
    "<p>" + profile.text + "</p>" +
    '<div class="dialog-actions"><button class="button clay" type="button" data-profile-proposal="' +
    key + '">' + profile.action + '</button></div>');
}

function showProposal({ role, defaultTitle, commission = false } = {}) {
  const options = '<option value="">Chọn vai trò</option>' + roles.map(item =>
    '<option' + (role === item ? ' selected' : '') + '>' + item + '</option>').join("");
  const heading = commission ? "Yêu cầu đặt chế tác" : "Đề xuất hợp tác";
  openDialog(titleBlock("Remix Space", heading,
    commission ? "Mô tả sản phẩm và họa tiết bạn muốn đặt làm." : "Cho đội biết bạn muốn cùng ai phát triển sản phẩm gì.") +
    '<form class="form-fields" data-proposal-form>' +
    '<label>Vai trò<select name="role" required>' + options + '</select></label>' +
    '<label>Tên ý tưởng<input name="title" maxlength="100" required placeholder="Ví dụ: Bộ quà gốm cho khách sạn"></label>' +
    '<label>Mô tả yêu cầu<textarea name="brief" maxlength="700" required placeholder="Chất liệu, số lượng hoặc dịp sử dụng"></textarea></label>' +
    '<p class="notice">Luồng mô phỏng. Nội dung biểu mẫu dùng để xem xác nhận ngay trên trang.</p>' +
    '<p class="form-error" role="alert" hidden>Nhập tên ý tưởng và mô tả yêu cầu để tiếp tục.</p>' +
    '<div class="dialog-actions"><button class="button clay" type="submit">Gửi đề xuất thử</button></div></form>');
  if (defaultTitle) {
    dialogContent.querySelector('input[name="title"]').value = defaultTitle;
  }
}

function showCart(focusSelector = "") {
  const cart = titleBlock("Artisan Shop", "Giỏ hàng");
  if (!state.cart) {
    openDialog(cart + '<p>Giỏ hàng đang trống.</p><div class="dialog-actions">' +
      '<button class="button dark" type="button" data-browse>Khám phá sản phẩm</button></div>');
    return;
  }
  const total = state.cart * buyProduct.price;
  openDialog(cart + '<ul class="cart-list"><li class="cart-row"><div><strong>' + buyProduct.name +
    '</strong><p>' + currency.format(buyProduct.price) + ' mỗi khay</p></div>' +
    '<div class="cart-controls"><button type="button" data-cart-change="-1" aria-label="Giảm số lượng">−</button>' +
    '<span aria-label="Số lượng">' + state.cart + '</span><button type="button" data-cart-change="1" aria-label="Tăng số lượng"' +
    (state.cart >= buyProduct.limit ? ' disabled' : '') + '>+</button></div></li></ul>' +
    '<p class="cart-total"><strong>Tạm tính</strong><strong>' + currency.format(total) + '</strong></p>' +
    '<p class="notice">Đơn minh họa · Không có giao dịch thanh toán.</p>' +
    '<div class="dialog-actions"><button type="button" class="button clay" data-checkout>Xác nhận đơn thử</button></div>');
  if (focusSelector) {
    dialogContent.querySelector(focusSelector)?.focus({ preventScroll: true });
  }
}

function changeCart(delta) {
  state.cart = Math.max(0, Math.min(buyProduct.limit, state.cart + delta));
  saveState();
  refreshCounters();
}

function showStep(id) {
  const step = steps[id];
  if (!step) return;
  document.querySelector("#step-actors").textContent = step.actors;
  document.querySelector("#step-title").textContent = step.title;
  document.querySelector("#step-description").textContent = step.description;
  document.querySelectorAll("[data-step]").forEach(button => {
    button.setAttribute("aria-pressed", Number(button.dataset.step) === id);
  });
}

function setMenu(open) {
  document.querySelector(".main-nav").classList.toggle("is-open", open);
  const toggle = document.querySelector(".menu-toggle");
  toggle.setAttribute("aria-expanded", open);
  toggle.setAttribute("aria-label", open ? "Đóng menu" : "Mở menu");
}

function updateNav() {
  document.querySelectorAll(".main-nav a").forEach(link => {
    if (link.hash === location.hash) link.setAttribute("aria-current", "location");
    else link.removeAttribute("aria-current");
  });
}

document.addEventListener("click", event => {
  const target = event.target.closest("button, .main-nav a");
  if (!target) return;

  if (target.matches(".menu-toggle")) setMenu(target.getAttribute("aria-expanded") !== "true");
  else if (target.matches(".main-nav a")) setMenu(false);
  else if (target.hasAttribute("data-close")) dialog.close();
  else if (target.hasAttribute("data-browse")) {
    dialog.close();
    location.hash = "bo-suu-tap";
  }
  else if (target.hasAttribute("data-cart")) showCart();
  else if (target.hasAttribute("data-proposal")) {
    setMenu(false);
    showProposal();
  }
  else if (target.hasAttribute("data-commission")) {
    showProposal({ role: "Khách hàng cá nhân", defaultTitle: "Gốm vẽ theo yêu cầu", commission: true });
  }
  else if (target.hasAttribute("data-add")) {
    if (state.cart >= buyProduct.limit) {
      showCart();
      return;
    }
    changeCart(1);
    showCart();
  }
  else if (target.hasAttribute("data-checkout")) {
    const amount = state.cart;
    changeCart(-amount);
    success("Đã xác nhận đơn thử", "Đơn mô phỏng gồm " + amount + " khay tre đan. Giỏ hàng đã được cập nhật.");
  }
  else if (target.dataset.cartChange) {
    changeCart(Number(target.dataset.cartChange));
    showCart('[data-cart-change="' + target.dataset.cartChange + '"]:not(:disabled)');
  }
  else if (target.dataset.product) showProduct(products.find(product => product.id === target.dataset.product));
  else if (target.dataset.profile) showProfile(target.dataset.profile);
  else if (target.dataset.profileProposal) {
    const profile = profiles[target.dataset.profileProposal];
    showProposal({ defaultTitle: "Hợp tác với " + profile.title });
  }
  else if (target.dataset.filter) renderProducts(target.dataset.filter);
  else if (target.dataset.step !== undefined) showStep(Number(target.dataset.step));
});

dialog.addEventListener("close", () => {
  if (dialogTrigger?.getClientRects().length) dialogTrigger.focus({ preventScroll: true });
  else if (dialogTrigger?.classList.contains("mobile-proposal")) document.querySelector(".menu-toggle").focus();
});

dialog.addEventListener("submit", event => {
  event.preventDefault();
  const form = event.target;
  const values = new FormData(form);

  if (form.hasAttribute("data-preorder-form")) {
    const quantity = Number(values.get("quantity"));
    if (!Number.isInteger(quantity) || quantity < 1 || reserved() + quantity > preorderProduct.limit) {
      showProduct(preorderProduct);
      return;
    }
    state.preorders += quantity;
    saveState();
    refreshCounters();
    success("Đã ghi nhận đặt trước", "Bạn vừa đặt thử " + quantity + " bộ Gốm Hội An đương đại. Tiến độ lô đã được cập nhật.");
  }

  if (form.hasAttribute("data-proposal-form")) {
    const title = values.get("title").trim();
    const brief = values.get("brief").trim();
    if (!title || !brief) {
      form.querySelector(".form-error").hidden = false;
      form.elements[!title ? "title" : "brief"].focus();
      return;
    }
    success("Đã xem trước đề xuất", "Đây là nội dung bạn vừa nhập trong luồng mô phỏng.");
    const summary = document.createElement("p");
    summary.className = "notice";
    summary.textContent = title + " · " + values.get("role");
    dialogContent.querySelector(".dialog-actions").before(summary);
  }
});

window.addEventListener("hashchange", updateNav);
document.addEventListener("keydown", event => {
  if (event.key === "Escape" && document.querySelector(".main-nav").classList.contains("is-open")) {
    setMenu(false);
    document.querySelector(".menu-toggle").focus();
  }
});

renderProducts();
refreshCounters();
updateNav();

