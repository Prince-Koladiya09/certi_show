// --- 1. Initialize Supabase ---
// IMPORTANT: Paste your own URL and anon key here from the Supabase dashboard
const SUPABASE_URL = 'YOUR_SUPABASE_URL'; 
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.addEventListener('DOMContentLoaded', () => {
    const addCertificateBtn = document.getElementById('addCertificateBtn');
    const modal = document.getElementById('certificateModal');
    const closeButton = document.querySelector('.close-button');
    const certificateForm = document.getElementById('certificateForm');
    const certificateList = document.getElementById('certificate-list');
    const modalTitle = document.getElementById('modalTitle');
    const certificateIdField = document.getElementById('certificateId');

    // This global variable will hold the current list of certificates from the database
    let currentCertificates = [];

    // --- 2. Fetch and Display Certificates from Supabase ---
    const getCertificates = async () => {
        const { data, error } = await supabase
            .from('certificates')
            .select('*')
            .order('date', { ascending: false }); // Order by date, newest first

        if (error) {
            console.error('Error fetching certificates:', error);
            return;
        }
        
        currentCertificates = data; // Store the fetched data globally
        renderCertificates(currentCertificates);
    };
    
    // --- 3. UI Rendering ---
    const renderCertificates = (certificates) => {
        certificateList.innerHTML = '';
        if (!certificates || certificates.length === 0) {
            certificateList.innerHTML = '<p>No certificates added yet. Click "Add Certificate" to start.</p>';
            return;
        }
        certificates.forEach(cert => {
            const certCard = createCertificateCard(cert);
            certificateList.appendChild(certCard);
        });
    };

    const createCertificateCard = (cert) => {
        const certCard = document.createElement('div');
        certCard.classList.add('certificate-card');
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

    // --- 4. Open Modal for Adding or Editing ---
    const openModal = (id = null) => {
        certificateForm.reset();
        certificateIdField.value = '';
        if (id) {
            // Find the certificate from the globally stored list
            const cert = currentCertificates.find(c => c.id === id);
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

    const closeModal = () => modal.style.display = 'none';

    // --- Modal Event Listeners ---
    // *** FIX: Re-added the event listener for the Add Certificate button ***
    addCertificateBtn.addEventListener('click', () => openModal());
    closeButton.addEventListener('click', closeModal);
    window.addEventListener('click', (event) => {
        if (event.target === modal) closeModal();
    });

    // --- 5. Handle Form Submission (Add or Update) ---
    certificateForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const id = parseInt(certificateIdField.value);
        const certificateData = {
            name: document.getElementById('certificateName').value,
            company: document.getElementById('issuingCompany').value,
            date: document.getElementById('issueDate').value,
            field: document.getElementById('certificateField').value,
            details: document.getElementById('certificateDetails').value,
            link: document.getElementById('certificateLink').value.trim()
        };

        let error;
        if (id) {
            // If an ID exists, it's an UPDATE operation
            const { error: updateError } = await supabase
                .from('certificates')
                .update(certificateData)
                .eq('id', id);
            error = updateError;
        } else {
            // If there's no ID, it's an INSERT operation
            const { error: insertError } = await supabase
                .from('certificates')
                .insert([certificateData]);
            error = insertError;
        }

        if (error) {
            console.error('Error saving certificate:', error);
            alert('Failed to save certificate. See console for details.');
        } else {
            getCertificates(); // Re-fetch the data to show the changes
            closeModal();
        }
    });

    // --- 6. Handle Clicks on Edit and Delete Buttons ---
    certificateList.addEventListener('click', async (event) => {
        const card = event.target.closest('.certificate-card');
        if (!card) return;

        const id = parseInt(card.getAttribute('data-id'));

        if (event.target.classList.contains('edit-btn')) {
            openModal(id);
        }

        if (event.target.classList.contains('delete-btn')) {
            if (confirm('Are you sure you want to delete this certificate?')) {
                const { error } = await supabase
                    .from('certificates')
                    .delete()
                    .eq('id', id);

                if (error) {
                    console.error('Error deleting certificate:', error);
                } else {
                    getCertificates(); // Re-fetch data to update the UI
                }
            }
        }
    });

    // --- 7. Initial Load ---
    getCertificates();
});
