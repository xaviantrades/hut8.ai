
let currentStep = 1;

function showStep(step) {
    document.getElementById("step-1").classList.add("step-hidden");
    document.getElementById("step-2").classList.add("step-hidden");
    document.getElementById("step-3").classList.add("step-hidden");

    const activeStep = document.getElementById("step-" + step);

    if (activeStep) {
        activeStep.classList.remove("step-hidden");
    }
}

function nextStep() {
    if (currentStep < 3) {
        currentStep++;
        showStep(currentStep);
    }
}

function prevStep() {
    if (currentStep > 1) {
        currentStep--;
        showStep(currentStep);
    }
}

function handlePaymentSubmit(event) {
    event.preventDefault();

    const txInput = document.getElementById("transaction_id");

    if (!txInput) {
        console.error("transaction_id input not found.");
        return;
    }

    const txIdInput = txInput.value.trim();

    if (!txIdInput) {
        alert("Please enter your Transaction ID.");
        return;
    }

    const displayTxId = document.getElementById("displayTxId");

    if (displayTxId) {
        displayTxId.textContent = txIdInput.toUpperCase();
    }

    const modal = document.getElementById("verificationModal");

    if (modal) {
        modal.classList.add("payment-modal-open");

        // Wait 2 seconds, stop spinner/modal, then redirect
        setTimeout(() => {
            modal.classList.remove("payment-modal-open");
            window.location.href = "chats.html";
        }, 20000);
    } else {
        // If modal doesn't exist, still redirect
        setTimeout(() => {
            window.location.href = "chats.html";
        }, 8000);
    }
}

// Show Step 1 when page loads
document.addEventListener("DOMContentLoaded", function () {
    showStep(currentStep);
});
