




// 1. Wait for the page to load
    document.addEventListener("DOMContentLoaded", function() {
        
        // 2. Retrieve the temporary amount
        const savedAmount = sessionStorage.getItem("tempUsdtAmount");
        
        // 3. If an amount exists, update the text
        if (savedAmount) {
            document.getElementById("paymentAmount").textContent = savedAmount + " UGX";
            
            // 4. IMMEDIATELY remove it so it does not persist on refresh or return
            
        }
    });











