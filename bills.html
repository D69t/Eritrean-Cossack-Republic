// Генерация уникального ID пользователя
function getUserId() {
    let userId = localStorage.getItem('userId');
    if (!userId) {
        userId = 'user-' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('userId', userId);
    }
    return userId;
}

// Инициализация данных
function initBillsData() {
    if (!localStorage.getItem('bills')) {
        const initialBills = [
            {
                id: 'bill-1',
                title: 'Пример народной инициативы',
                content: 'Текст предлагаемого законопроекта будет отображаться здесь. Граждане могут ознакомиться с содержанием и проголосовать.',
                author: 'Совет Республики',
                date: '2025-01-15',
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

// Загрузка законопроектов
function loadBills(filter = 'all', page = 1) {
    const bills = JSON.parse(localStorage.getItem('bills')) || [];
    const userId = getUserId();
    const billsPerPage = 5;
    
    // Фильтрация
    let filteredBills = bills;
    if (filter !== 'all') {
        filteredBills = bills.filter(bill => bill.status === filter);
    }
    
    // Пагинация
    const totalPages = Math.ceil(filteredBills.length / billsPerPage);
    const startIdx = (page - 1) * billsPerPage;
    const paginatedBills = filteredBills.slice(startIdx, startIdx + billsPerPage);
    
    // Отрисовка
    const container = document.getElementById('bills-container');
    container.innerHTML = '';
    
    if (paginatedBills.length === 0) {
        container.innerHTML = '<div class="no-bills">Нет законопроектов по выбранному фильтру</div>';
    } else {
        paginatedBills.forEach(bill => {
            const hasVoted = bill.votes.voters.includes(userId);
            const billElement = document.createElement('div');
            billElement.className = `bill-card ${bill.status}`;
            billElement.innerHTML = `
                <div class="bill-header">
                    <h4>Законопроект: ${bill.title}</h4>
                    <div class="bill-meta">
                        <span class="bill-author">${bill.author}</span>
                        <span class="bill-date">${bill.date}</span>
                        <div class="bill-status ${bill.status}">${getStatusText(bill.status)}</div>
                    </div>
                </div>
                <div class="bill-content">
                    <p>${bill.content}</p>
                </div>
                <div class="bill-voting">
                    <div class="vote-buttons">
                        <button class="vote-btn vote-for" ${hasVoted || bill.status !== 'consideration' ? 'disabled' : ''}>ЗА</button>
                        <button class="vote-btn vote-against" ${hasVoted || bill.status !== 'consideration' ? 'disabled' : ''}>ПРОТИВ</button>
                    </div>
                    <div class="vote-stats">
                        <span class="for-count">${bill.votes.for}</span> за | 
                        <span class="against-count">${bill.votes.against}</span> против
                    </div>
                </div>
                ${bill.status !== 'consideration' ? 
                    `<div class="bill-result">
                        Решение: ${getStatusDescription(bill.status)}
                    </div>` : ''}
            `;
            container.appendChild(billElement);
            
            // Добавляем обработчики голосования
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
        });
    }
    
    // Обновление пагинации
    document.getElementById('page-info').textContent = `Страница ${page} из ${totalPages}`;
    document.getElementById('prev-page').disabled = page <= 1;
    document.getElementById('next-page').disabled = page >= totalPages;
    
    // Сохраняем текущие параметры
    currentFilter = filter;
    currentPage = page;
}

// Голосование за законопроект
function voteForBill(billId) {
    const bills = JSON.parse(localStorage.getItem('bills'));
    const bill = bills.find(b => b.id === billId);
    const userId = getUserId();
    
    if (bill && !bill.votes.voters.includes(userId)) {
        bill.votes.for++;
        bill.votes.voters.push(userId);
        localStorage.setItem('bills', JSON.stringify(bills));
        loadBills(currentFilter, currentPage);
    }
}

// Голосование против законопроекта
function voteAgainstBill(billId) {
    const bills = JSON.parse(localStorage.getItem('bills'));
    const bill = bills.find(b => b.id === billId);
    const userId = getUserId();
    
    if (bill && !bill.votes.voters.includes(userId)) {
        bill.votes.against++;
        bill.votes.voters.push(userId);
        localStorage.setItem('bills', JSON.stringify(bills));
        loadBills(currentFilter, currentPage);
    }
}

// Отправка нового законопроекта
function submitNewBill(event) {
    event.preventDefault();
    
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
        event.target.reset();
        loadBills(currentFilter, 1);
    }
}

// Вспомогательные функции
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

// Инициализация
let currentFilter = 'all';
let currentPage = 1;

document.addEventListener('DOMContentLoaded', () => {
    // Установка ID пользователя
    document.getElementById('user-id').textContent = getUserId().substr(0, 8);
    
    // Инициализация данных
    initBillsData();
    
    // Загрузка законопроектов
    loadBills();
    
    // Обработчик формы
    document.getElementById('bill-submission')?.addEventListener('submit', submitNewBill);
    
    // Фильтры
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelector('.filter-btn.active').classList.remove('active');
            btn.classList.add('active');
            loadBills(btn.dataset.filter, 1);
        });
    });
    
    // Пагинация
    document.getElementById('prev-page').addEventListener('click', () => {
        if (currentPage > 1) {
            loadBills(currentFilter, currentPage - 1);
        }
    });
    
    document.getElementById('next-page').addEventListener('click', () => {
        loadBills(currentFilter, currentPage + 1);
    });
});
