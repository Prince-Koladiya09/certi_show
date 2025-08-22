document.addEventListener('DOMContentLoaded', () => {
    const addCertificateBtn = document.getElementById('addCertificateBtn');
    const modal = document.getElementById('certificateModal');
    const closeButton = document.querySelector('.close-button');
    const certificateForm = document.getElementById('certificateForm');
    const certificateList = document.getElementById('certificate-list');
    const modalTitle = document.getElementById('modalTitle');
    const certificateIdField = document.getElementById('certificateId');

    let certificates = [
        {
            id: 1,
            name: 'Certified JavaScript Developer',
            company: 'Tech Institute',
            date: '2023-05-20',
            field: 'Web Development',
            details: 'Completed an intensive course on modern JavaScript, covering ES6+, async programming, and frameworks.',
            link: 'https://github.com/google/gemini-api'
        },
        {
            id: 2,
            name: 'Agile Project Management',
            company: 'Project Experts',
            date: '2022-11-15',
            field: 'Project Management',
            details: 'Certified in Agile and Scrum methodologies for efficient project delivery and team collaboration.',
            link: ''
        }
    ];

    const renderCertificates = () => {
        certificateList.innerHTML = '';
        certificates.forEach(cert => {
            const certCard = createCertificateCard(cert);
            certificateList.appendChild(certCard);
        });
    };

    const createCertificateCard = (cert, isNew = false) => {
        const certCard = document.createElement('div');
        certCard.classList.add('certificate-card');
        if (isNew) {
            certCard.classList.add('fade-in-up');
        }
        certCard.setAttribute('data-id', cert.id);

        const linkHTML = cert.link ?
            `<a href="${cert.link}" target="_blank" rel="noopener noreferrer" class="certificate-link-btn">View on GitHub</a>` :
            '';

        certCard.innerHTML = `
            <div>
                <h3>${cert.name}</h3>
                <p><strong>Company:</strong> ${cert.company}</p>
                <p><strong>Date:</strong> ${cert.date}</p>
                <p><strong>Field:</strong> ${cert.field}</p>
                <p><strong>Details:</strong> ${cert.details}</p>
                ${linkHTML}
            </div>
            <div class="card-actions">
                <button class="edit-btn">Edit</button>
                <button class="delete-btn">Delete</button>
            </div>
        `;
        return certCard;
    };


    const openModal = (id = null) => {
        certificateForm.reset();
        certificateIdField.value = '';
        if (id) {
            const cert = certificates.find(c => c.id === id);
            if (cert) {
                modalTitle.textContent = 'Edit Certificate';
                certificateIdField.value = cert.id;
                document.getElementById('certificateName').value = cert.name;
                document.getElementById('issuingCompany').value = cert.company;
                document.getElementById('issueDate').value = cert.date;
                document.getElementById('certificateField').value = cert.field;
                document.getElementById('certificateDetails').value = cert.details;
                document.getElementById('certificateLink').value = cert.link || '';
            }
        } else {
            modalTitle.textContent = 'Add Certificate';
        }
        modal.style.display = 'block';
    };

    const closeModal = () => {
        modal.style.display = 'none';
    };

    addCertificateBtn.addEventListener('click', () => openModal());
    closeButton.addEventListener('click', closeModal);
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            closeModal();
        }
    });

    certificateForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const id = parseInt(certificateIdField.value);
        const certificateData = {
            id: id || Date.now(),
            name: document.getElementById('certificateName').value,
            company: document.getElementById('issuingCompany').value,
            date: document.getElementById('issueDate').value,
            field: document.getElementById('certificateField').value,
            details: document.getElementById('certificateDetails').value,
            link: document.getElementById('certificateLink').value.trim()
        };

        if (id) {
            certificates = certificates.map(cert => cert.id === id ? certificateData : cert);
        } else {
            certificates.push(certificateData);
        }
        
        renderCertificates(); // Re-render the whole list after adding or updating
        closeModal();
    });

    // *** FIX IS IN THIS SECTION ***
    certificateList.addEventListener('click', (event) => {
        const card = event.target.closest('.certificate-card');
        if (!card) return;

        const id = parseInt(card.getAttribute('data-id'));

        if (event.target.classList.contains('edit-btn')) {
            openModal(id);
        }

        if (event.target.classList.contains('delete-btn')) {
            if (confirm('Are you sure you want to delete this certificate?')) {
                // 1. Filter the array to remove the certificate
                certificates = certificates.filter(cert => cert.id !== id);
                // 2. Re-render the entire list from the updated array
                renderCertificates();
            }
        }
    });

    renderCertificates();
});
