// --- 1. Initialize Supabase ---
const SUPABASE_URL = 'https://crrtisjgpipyojyhztyz.supabase.co'; 
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNycnRpc2pncGlweW9qeWh6dHl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4NTk4ODAsImV4cCI6MjA3MTQzNTg4MH0.LyBf_vp73BxnDVPdbjBDIf1g1YnzfbpskES2fRUg2Gc';

// Correctly initialize the Supabase client
const db = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.addEventListener('DOMContentLoaded', () => {
    const addCertificateBtn = document.getElementById('addCertificateBtn');
    const modal = document.getElementById('certificateModal');
    const closeButton = document.querySelector('.close-button');
    const certificateForm = document.getElementById('certificateForm');
    const certificateList = document.getElementById('certificate-list');
    const modalTitle = document.getElementById('modalTitle');
    const certificateIdField = document.getElementById('certificateId');

    let currentCertificates = [];

    // --- 2. Fetch and Display Certificates ---
    const getCertificates = async () => {
        const { data, error } = await db
            .from('certificates')
            .select('*')
            .order('issueDate', { ascending: false });

        if (error) {
            console.error('Error fetching certificates:', error);
            return;
        }
        
        currentCertificates = data;
        renderCertificates(currentCertificates);
    };
    
    // --- 3. Render UI ---
    const renderCertificates = (certificates) => {
        certificateList.innerHTML = '';
        if (!certificates || certificates.length === 0) {
            certificateList.innerHTML = '<p>No certificates added yet. Click "Add Certificate" to start.</p>';
            return;
        }
        certificates.forEach((cert, index) => {
            const certCard = createCertificateCard(cert);
            certCard.style.animationDelay = `${index * 0.1}s`; // Staggered animation
            certificateList.appendChild(certCard);
        });
    };

    const createCertificateCard = (cert) => {
        const certCard = document.createElement('div');
        certCard.classList.add('certificate-card');
        certCard.setAttribute('data-id', cert.id);

        const linkHTML = cert.certificateLink ?
            `<a href="${cert.certificateLink}" target="_blank" rel="noopener noreferrer" class="certificate-link-btn">View on GitHub</a>` :
            '';

        certCard.innerHTML = `
            <div>
                <h3>${cert.certificateName}</h3>
                <p><strong>Company:</strong> ${cert.issuingCompany}</p>
                <p><strong>Date:</strong> ${cert.issueDate}</p>
                <p><strong>Field:</strong> ${cert.certificateField}</p>
                <p><strong>Details:</strong> ${cert.certificateDetails}</p>
                ${linkHTML}
            </div>
            <div class="card-actions">
                <button class="edit-btn">Edit</button>
                <button class="delete-btn">Delete</button>
            </div>
        `;
        return certCard;
    };

    // --- 4. Modal Management ---
    const openModal = (id = null) => {
        certificateForm.reset();
        certificateIdField.value = '';
        if (id) {
            const cert = currentCertificates.find(c => c.id === id);
            if (cert) {
                modalTitle.textContent = 'Edit Certificate';
                certificateIdField.value = cert.id;
                document.getElementById('certificateName').value = cert.certificateName;
                document.getElementById('issuingCompany').value = cert.issuingCompany;
                document.getElementById('issueDate').value = cert.issueDate;
                document.getElementById('certificateField').value = cert.certificateField;
                document.getElementById('certificateDetails').value = cert.certificateDetails;
                document.getElementById('certificateLink').value = cert.certificateLink || '';
            }
        } else {
            modalTitle.textContent = 'Add Certificate';
        }
        modal.style.display = 'block';
    };

    const closeModal = () => modal.style.display = 'none';

    addCertificateBtn.addEventListener('click', () => openModal());
    closeButton.addEventListener('click', closeModal);
    window.addEventListener('click', (event) => {
        if (event.target === modal) closeModal();
    });

    // --- 5. Handle Form Submission (Add/Update) ---
    certificateForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const id = certificateIdField.value ? parseInt(certificateIdField.value) : null;
        const certificateData = {
            certificateName: document.getElementById('certificateName').value,
            issuingCompany: document.getElementById('issuingCompany').value,
            issueDate: document.getElementById('issueDate').value,
            certificateField: document.getElementById('certificateField').value,
            certificateDetails: document.getElementById('certificateDetails').value,
            certificateLink: document.getElementById('certificateLink').value.trim()
        };

        let error;
        if (id) {
            const { error: updateError } = await db
                .from('certificates')
                .update(certificateData)
                .eq('id', id);
            error = updateError;
        } else {
            const { error: insertError } = await db
                .from('certificates')
                .insert([certificateData]);
            error = insertError;
        }

        if (error) {
            console.error('Error saving certificate:', error);
            alert('Failed to save certificate. See console for details.');
        } else {
            getCertificates();
            closeModal();
        }
    });

    // --- 6. Handle Edit and Delete ---
    certificateList.addEventListener('click', async (event) => {
        const card = event.target.closest('.certificate-card');
        if (!card) return;

        const id = parseInt(card.getAttribute('data-id'));

        if (event.target.classList.contains('edit-btn')) {
            openModal(id);
        }

        if (event.target.classList.contains('delete-btn')) {
            if (confirm('Are you sure you want to delete this certificate?')) {
                const { error } = await db
                    .from('certificates')
                    .delete()
                    .eq('id', id);

                if (error) {
                    console.error('Error deleting certificate:', error);
                } else {    
                    getCertificates();
                }
            }
        }
    });

    // --- 7. Initial Load ---
    getCertificates();
});
