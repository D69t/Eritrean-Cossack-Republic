// Конфигурация администратора
const ADMIN_CREDENTIALS = {
    login: "Admin",
    password: "EritreanCossack2025"
  };
  
  // Состояние приложения
  let isAdmin = false;
  let currentFilter = 'all';
  let currentPage = 1;
  
  // Инициализация при загрузке страницы
  document.addEventListener('DOMContentLoaded', function() {
    initBillsData();
    setupEventListeners();
    loadBills();
    
    // Показать ID пользователя если есть элемент
    const userIdElement = document.getElementById('user-id');
    if (userIdElement) {
      userIdElement.textContent = getUserId().substr(0, 8);
    }
  });
  
  // Инициализация данных
  function initBillsData() {
    if (!localStorage.getItem('bills')) {
      const initialBills = [
        {
          id: 'bill-1',
          title: 'Пример народной инициативы',
          content: 'Текст предлагаемого законопроекта будет отображаться здесь. Граждане могут ознакомиться с содержанием и проголосовать.',
          author: 'Совет Республики',
          date: new Date().toISOString().split('T')[0],
          status: 'consideration',
          votes: {
            for: 12,
            against: 5,
            voters: []
          }
        }
      ];
      localStorage.setItem('bills', JSON.stringify(initialBills));
    }
  }
  
  // Настройка обработчиков событий
  function setupEventListeners() {
    // Форма добавления законопроекта
    const billForm = document.getElementById('bill-submission');
    if (billForm) {
      billForm.addEventListener('submit', function(e) {
        e.preventDefault();
        submitNewBill();
      });
    }
  
    // Фильтры
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        document.querySelector('.filter-btn.active').classList.remove('active');
        this.classList.add('active');
        currentFilter = this.dataset.filter;
        currentPage = 1;
        loadBills();
      });
    });
  
    // Пагинация
    const prevPageBtn = document.getElementById('prev-page');
    const nextPageBtn = document.getElementById('next-page');
    
    if (prevPageBtn) {
      prevPageBtn.addEventListener('click', function() {
        if (currentPage > 1) {
          currentPage--;
          loadBills();
        }
      });
    }
    
    if (nextPageBtn) {
      nextPageBtn.addEventListener('click', function() {
        currentPage++;
        loadBills();
      });
    }
  
    // Админ-доступ
    const adminAccessBtn = document.getElementById('admin-access');
    if (adminAccessBtn) {
      adminAccessBtn.addEventListener('click', function() {
        if (isAdmin) {
          logoutAdmin();
        } else {
          showAdminModal();
        }
      });
    }
  
    // Модальное окно
    const closeModalBtn = document.querySelector('.close-modal');
    if (closeModalBtn) {
      closeModalBtn.addEventListener('click', hideAdminModal);
    }
  
    // Форма входа администратора
    const adminForm = document.getElementById('admin-login-form');
    if (adminForm) {
      adminForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const login = document.getElementById('admin-login').value;
        const password = document.getElementById('admin-password').value;
        loginAdmin(login, password);
      });
    }
  }
  
  // Загрузка и отображение законопроектов
  function loadBills() {
    const bills = JSON.parse(localStorage.getItem('bills')) || [];
    const filteredBills = currentFilter === 'all' 
      ? bills 
      : bills.filter(bill => bill.status === currentFilter);
    
    const billsPerPage = 5;
    const startIdx = (currentPage - 1) * billsPerPage;
    const paginatedBills = filteredBills.slice(startIdx, startIdx + billsPerPage);
    const totalPages = Math.ceil(filteredBills.length / billsPerPage);
  
    // Отрисовка законопроектов
    const container = document.getElementById('bills-container');
    if (container) {
      container.innerHTML = '';
      
      if (paginatedBills.length === 0) {
        container.innerHTML = '<div class="no-bills">Нет законопроектов по выбранному фильтру</div>';
      } else {
        paginatedBills.forEach(bill => {
          const hasVoted = bill.votes.voters.includes(getUserId());
          const billElement = createBillElement(bill, hasVoted);
          container.appendChild(billElement);
        });
      }
    }
  
    // Обновление пагинации
    updatePagination(totalPages);
    
    // Показать админ-панель если вошли как админ
    if (isAdmin) {
      document.querySelectorAll('.admin-actions').forEach(el => {
        el.style.display = 'flex';
      });
    }
  }
  
  // Создание элемента законопроекта
  function createBillElement(bill, hasVoted) {
    const billElement = document.createElement('div');
    billElement.className = `bill-card ${bill.status}`;
    
    billElement.innerHTML = `
      <div class="bill-header">
        <h3 class="bill-title">Законопроект: ${bill.title}</h3>
        <div class="bill-meta">
          <span class="bill-author">${bill.author}</span>
          <span class="bill-date">${bill.date}</span>
          <span class="bill-status status-${bill.status}">
            ${getStatusText(bill.status)}
          </span>
        </div>
      </div>
      <div class="bill-content">
        <p>${bill.content}</p>
      </div>
      <div class="vote-section">
        <div class="vote-buttons">
          <button class="vote-btn vote-for" ${hasVoted || bill.status !== 'consideration' ? 'disabled' : ''}>
            ЗА
          </button>
          <button class="vote-btn vote-against" ${hasVoted || bill.status !== 'consideration' ? 'disabled' : ''}>
            ПРОТИВ
          </button>
        </div>
        <div class="vote-stats">
          <span class="for-count">${bill.votes.for}</span> за | 
          <span class="against-count">${bill.votes.against}</span> против
        </div>
      </div>
      ${bill.status !== 'consideration' ? `
        <div class="bill-result">
          Решение: ${getStatusDescription(bill.status)}
        </div>
      ` : ''}
      <div class="admin-actions" style="display: none;">
        <button class="delete-btn" data-bill-id="${bill.id}">Удалить</button>
        <select class="status-select" data-bill-id="${bill.id}">
          <option value="consideration" ${bill.status === 'consideration' ? 'selected' : ''}>На рассмотрении</option>
          <option value="approved" ${bill.status === 'approved' ? 'selected' : ''}>Принят</option>
          <option value="rejected" ${bill.status === 'rejected' ? 'selected' : ''}>Отклонён</option>
        </select>
      </div>
    `;
    
    // Добавление обработчиков
    if (bill.status === 'consideration') {
      const voteForBtn = billElement.querySelector('.vote-for');
      const voteAgainstBtn = billElement.querySelector('.vote-against');
      
      if (voteForBtn && !hasVoted) {
        voteForBtn.addEventListener('click', () => voteForBill(bill.id));
      }
      if (voteAgainstBtn && !hasVoted) {
        voteAgainstBtn.addEventListener('click', () => voteAgainstBill(bill.id));
      }
    }
    
    // Обработчики для админ-панели
    if (isAdmin) {
      const deleteBtn = billElement.querySelector('.delete-btn');
      const statusSelect = billElement.querySelector('.status-select');
      
      if (deleteBtn) {
        deleteBtn.addEventListener('click', (e) => {
          deleteBill(e.target.dataset.billId);
        });
      }
      
      if (statusSelect) {
        statusSelect.addEventListener('change', (e) => {
          updateBillStatus(e.target.dataset.billId, e.target.value);
        });
      }
    }
    
    return billElement;
  }
  
  // Обновление пагинации
  function updatePagination(totalPages) {
    const pageInfo = document.getElementById('page-info');
    const prevPageBtn = document.getElementById('prev-page');
    const nextPageBtn = document.getElementById('next-page');
    
    if (pageInfo) pageInfo.textContent = `Страница ${currentPage} из ${totalPages}`;
    if (prevPageBtn) prevPageBtn.disabled = currentPage <= 1;
    if (nextPageBtn) nextPageBtn.disabled = currentPage >= totalPages;
  }
  
  // Голосование за законопроект
  function voteForBill(billId) {
    const bills = JSON.parse(localStorage.getItem('bills')) || [];
    const bill = bills.find(b => b.id === billId);
    
    if (bill && !bill.votes.voters.includes(getUserId())) {
      bill.votes.for++;
      bill.votes.voters.push(getUserId());
      localStorage.setItem('bills', JSON.stringify(bills));
      loadBills();
    }
  }
  
  // Голосование против законопроекта
  function voteAgainstBill(billId) {
    const bills = JSON.parse(localStorage.getItem('bills')) || [];
    const bill = bills.find(b => b.id === billId);
    
    if (bill && !bill.votes.voters.includes(getUserId())) {
      bill.votes.against++;
      bill.votes.voters.push(getUserId());
      localStorage.setItem('bills', JSON.stringify(bills));
      loadBills();
    }
  }
  
  // Добавление нового законопроекта
  function submitNewBill() {
    const title = document.getElementById('bill-title').value.trim();
    const content = document.getElementById('bill-content').value.trim();
    const author = document.getElementById('bill-author').value.trim() || 'Анонимный гражданин';
    
    if (title && content) {
      const newBill = {
        id: 'bill-' + Date.now(),
        title: title,
        content: content,
        author: author,
        date: new Date().toISOString().split('T')[0],
        status: 'consideration',
        votes: {
          for: 0,
          against: 0,
          voters: []
        }
      };
      
      const bills = JSON.parse(localStorage.getItem('bills')) || [];
      bills.unshift(newBill);
      localStorage.setItem('bills', JSON.stringify(bills));
      
      alert(`Законопроект "${title}" успешно предложен!`);
      document.getElementById('bill-submission').reset();
      currentPage = 1;
      loadBills();
    }
  }
  
  // Удаление законопроекта
  function deleteBill(billId) {
    if (confirm("Вы уверены, что хотите удалить этот законопроект?")) {
      const bills = JSON.parse(localStorage.getItem('bills')) || [];
      const updatedBills = bills.filter(bill => bill.id !== billId);
      localStorage.setItem('bills', JSON.stringify(updatedBills));
      loadBills();
    }
  }
  
  // Изменение статуса законопроекта
  function updateBillStatus(billId, newStatus) {
    const bills = JSON.parse(localStorage.getItem('bills')) || [];
    const billIndex = bills.findIndex(bill => bill.id === billId);
    
    if (billIndex !== -1) {
      bills[billIndex].status = newStatus;
      localStorage.setItem('bills', JSON.stringify(bills));
      loadBills();
    }
  }
  
  // Работа с администратором
  function showAdminModal() {
    const modal = document.getElementById('admin-modal');
    if (modal) modal.style.display = 'block';
  }
  
  function hideAdminModal() {
    const modal = document.getElementById('admin-modal');
    if (modal) modal.style.display = 'none';
  }
  
  function loginAdmin(login, password) {
    if (login === ADMIN_CREDENTIALS.login && password === ADMIN_CREDENTIALS.password) {
      isAdmin = true;
      hideAdminModal();
      document.body.classList.add('admin-mode');
      const adminAccessBtn = document.getElementById('admin-access');
      if (adminAccessBtn) adminAccessBtn.textContent = "RR (Выйти)";
      alert("Вы вошли как администратор");
      loadBills();
    } else {
      alert("Неверные учетные данные");
    }
  }
  
  function logoutAdmin() {
    isAdmin = false;
    document.body.classList.remove('admin-mode');
    const adminAccessBtn = document.getElementById('admin-access');
    if (adminAccessBtn) adminAccessBtn.textContent = "RR";
    alert("Вы вышли из режима администратора");
    loadBills();
  }
  
  // Вспомогательные функции
  function getUserId() {
    let userId = localStorage.getItem('userId');
    if (!userId) {
      userId = 'user-' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('userId', userId);
    }
    return userId;
  }
  
  function getStatusText(status) {
    const statusMap = {
      'consideration': 'На рассмотрении',
      'approved': 'Принят',
      'rejected': 'Отклонён'
    };
    return statusMap[status] || status;
  }
  
  function getStatusDescription(status) {
    const descriptionMap = {
      'approved': 'Законопроект принят Советом Республики',
      'rejected': 'Законопроект отклонён Советом Республики'
    };
    return descriptionMap[status] || '';
  }
