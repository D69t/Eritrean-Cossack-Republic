// Хранилище данных
class BillsStorage {
addComment(billId, user, text) {
  const bill = this.bills.find(b => b.id === billId);
  if (bill) {
    if (!bill.comments) bill.comments = [];
    bill.comments.push({
      id: 'comment-' + Date.now(),
      user,
      text,
      date: new Date().toISOString()
    });
    this.save();
  }
}
  constructor() {
    this.bills = JSON.parse(localStorage.getItem('bills')) || [];
    this.initSampleData();
  }

  initSampleData() {
    if (this.bills.length === 0) {
      this.bills = [
        {
          id: 'bill-' + Date.now(),
          title: 'Пример законопроекта',
          content: 'Это тестовый законопроект для демонстрации работы системы',
          author: 'Администрация',
          date: new Date().toISOString(),
          status: 'consideration',
          votes: { for: 0, against: 0, voters: [] }
        }
      ];
      this.save();
    }
  }

  save() {
    localStorage.setItem('bills', JSON.stringify(this.bills));
  }

  addBill(bill) {
    this.bills.unshift(bill);
    this.save();
  }

  getBills(filter = 'all') {
    return filter === 'all' 
      ? [...this.bills] 
      : this.bills.filter(bill => bill.status === filter);
  }

  vote(billId, userId, voteType) {
    const bill = this.bills.find(b => b.id === billId);
    if (!bill || bill.votes.voters.includes(userId)) return false;

    bill.votes[voteType]++;
    bill.votes.voters.push(userId);
    this.save();
    return true;
  }

  updateStatus(billId, status) {
    const bill = this.bills.find(b => b.id === billId);
    if (bill) {
      bill.status = status;
      this.save();
    }
  }

  deleteBill(billId) {
    this.bills = this.bills.filter(bill => bill.id !== billId);
    this.save();
  }
}

// UI контроллер
class BillsUI {
  constructor() {
    this.storage = new BillsStorage();
    this.userId = this.getUserId();
    this.currentFilter = 'all';
    this.currentPage = 1;
    this.billsPerPage = 5;
    this.isAdmin = false;
  }

  getUserId() {
    let userId = localStorage.getItem('userId');
    if (!userId) {
      userId = 'user-' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('userId', userId);
    }
    return userId;
  }

  init() {
    this.setupEventListeners();
    this.renderBills();
    this.updateUserInfo();
  }

  setupEventListeners() {
    // Форма добавления
    document.getElementById('bill-submission')?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.submitNewBill();
    });

    // Фильтры
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelector('.filter-btn.active').classList.remove('active');
        btn.classList.add('active');
        this.currentFilter = btn.dataset.filter;
        this.currentPage = 1;
        this.renderBills();
      });
    });

    // Пагинация
    document.getElementById('prev-page')?.addEventListener('click', () => {
      if (this.currentPage > 1) {
        this.currentPage--;
        this.renderBills();
      }
    });

    document.getElementById('next-page')?.addEventListener('click', () => {
      this.currentPage++;
      this.renderBills();
    });

    // Админ-доступ
    document.getElementById('admin-access')?.addEventListener('click', () => {
      if (this.isAdmin) {
        this.logoutAdmin();
      } else {
        this.showAdminModal();
      }
    });

    // Модальное окно
    document.querySelector('.close-modal')?.addEventListener('click', () => {
      this.hideAdminModal();
    });

    document.getElementById('admin-login-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.loginAdmin();
    });
  }

  renderBills() {
    const container = document.getElementById('bills-container');
    if (!container) return;

    const filteredBills = this.storage.getBills(this.currentFilter);
    const startIdx = (this.currentPage - 1) * this.billsPerPage;
    const paginatedBills = filteredBills.slice(startIdx, startIdx + this.billsPerPage);
    const totalPages = Math.ceil(filteredBills.length / this.billsPerPage);

    container.innerHTML = paginatedBills.length === 0
      ? '<div class="no-bills">Нет законопроектов по выбранному фильтру</div>'
      : paginatedBills.map(bill => this.createBillElement(bill)).join('');

    this.updatePagination(totalPages);
    this.setupVoteHandlers();
    this.setupAdminHandlers();
  }

  createBillElement(bill) {
    const hasVoted = bill.votes.voters.includes(this.userId);
    const voteButtonsDisabled = hasVoted || bill.status !== 'consideration' ? 'disabled' : '';

    return `
      <div class="bill-card ${bill.status}" data-id="${bill.id}">
        <div class="bill-header">
          <h3>${bill.title}</h3>
          <div class="bill-meta">
            <span>Автор: ${bill.author}</span>
            <span>Дата: ${new Date(bill.date).toLocaleDateString()}</span>
            <span class="status ${bill.status}">${this.getStatusText(bill.status)}</span>
          </div>
        </div>
        <div class="bill-content">
          <p>${bill.content}</p>
        </div>
        <div class="vote-section">
          <div class="vote-buttons">
            <button class="vote-btn vote-for" ${voteButtonsDisabled}>ЗА (${bill.votes.for})</button>
            <button class="vote-btn vote-against" ${voteButtonsDisabled}>ПРОТИВ (${bill.votes.against})</button>
          </div>
          ${this.isAdmin ? `
            <div class="admin-actions">
              <select class="status-select">
                <option value="consideration" ${bill.status === 'consideration' ? 'selected' : ''}>На рассмотрении</option>
                <option value="approved" ${bill.status === 'approved' ? 'selected' : ''}>Принят</option>
                <option value="rejected" ${bill.status === 'rejected' ? 'selected' : ''}>Отклонён</option>
              </select>
              <button class="delete-btn">Удалить</button>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  setupVoteHandlers() {
    document.querySelectorAll('.vote-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const billId = e.target.closest('.bill-card').dataset.id;
        const voteType = e.target.classList.contains('vote-for') ? 'for' : 'against';
        
        if (this.storage.vote(billId, this.userId, voteType)) {
          this.renderBills();
        } else {
          alert('Вы уже голосовали за этот законопроект');
        }
      });
    });
  }

  setupAdminHandlers() {
    if (!this.isAdmin) return;

    document.querySelectorAll('.status-select').forEach(select => {
      select.addEventListener('change', (e) => {
        const billId = e.target.closest('.bill-card').dataset.id;
        this.storage.updateStatus(billId, e.target.value);
        this.renderBills();
      });
    });

    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        if (confirm('Удалить этот законопроект?')) {
          const billId = e.target.closest('.bill-card').dataset.id;
          this.storage.deleteBill(billId);
          this.renderBills();
        }
      });
    });
  }

  submitNewBill() {
    const title = document.getElementById('bill-title').value.trim();
    const content = document.getElementById('bill-content').value.trim();
    const author = document.getElementById('bill-author').value.trim() || 'Аноним';

    if (title && content) {
      const newBill = {
        id: 'bill-' + Date.now(),
        title,
        content,
        author,
        date: new Date().toISOString(),
        status: 'consideration',
        votes: { for: 0, against: 0, voters: [] }
      };

      this.storage.addBill(newBill);
      document.getElementById('bill-submission').reset();
      this.currentPage = 1;
      this.renderBills();
      alert('Законопроект успешно добавлен!');
    } else {
      alert('Заполните все обязательные поля');
    }
  }

  updatePagination(totalPages) {
    const pageInfo = document.getElementById('page-info');
    const prevBtn = document.getElementById('prev-page');
    const nextBtn = document.getElementById('next-page');

    if (pageInfo) pageInfo.textContent = `Страница ${this.currentPage} из ${totalPages}`;
    if (prevBtn) prevBtn.disabled = this.currentPage <= 1;
    if (nextBtn) nextBtn.disabled = this.currentPage >= totalPages;
  }

  updateUserInfo() {
    const userIdElement = document.getElementById('user-id');
    if (userIdElement) userIdElement.textContent = this.userId.substr(0, 8);
  }

  showAdminModal() {
    document.getElementById('admin-modal').style.display = 'block';
  }

  hideAdminModal() {
    document.getElementById('admin-modal').style.display = 'none';
  }

  loginAdmin() {
    const login = document.getElementById('admin-login').value;
    const password = document.getElementById('admin-password').value;

    if (login === "Admin" && password === "EritreanCossack2025") {
      this.isAdmin = true;
      document.body.classList.add('admin-mode');
      document.getElementById('admin-access').textContent = "RR (Выйти)";
      this.hideAdminModal();
      this.renderBills();
    } else {
      alert('Неверные учетные данные');
    }
  }

  logoutAdmin() {
    this.isAdmin = false;
    document.body.classList.remove('admin-mode');
    document.getElementById('admin-access').textContent = "RR";
    this.renderBills();
  }

  getStatusText(status) {
    const statusMap = {
      'consideration': 'На рассмотрении',
      'approved': 'Принят',
      'rejected': 'Отклонён'
    };
    return statusMap[status] || status;
  }
}

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', () => {
  new BillsUI().init();
});
