


/* ==============================
       OPEN DEPOSIT
    =============================== */

    function openDeposit() {

        window.location.href = "payment_form_spinner_fixed.html";
    }
  
    /* ==============================
       OPEN WITHDRAW
    =============================== */

    function openWithdraw() {

        document.getElementById("withdrawOverlay")
            .classList.add("active");

        document.body.style.overflow = "hidden";
    }

  
    /* ==============================
       OPEN BILL
    =============================== */

  
    
    /* ==============================
       OPEN BILL
    =============================== */

    
    /* ==============================
       OPEN BILL
    =============================== */

    function openInvite() {

        document.getElementById("inviteOverlay")
            .classList.add("active");

        document.body.style.overflow = "hidden";
    }
    /* ==============================
       OPEN BILL
    =============================== */

    function openMyteam() {

        document.getElementById("myteamoverlay")
            .classList.add("active");

        document.body.style.overflow = "hidden";
    }
    /* ==============================
       OPEN BILL
    =============================== */

    function openViptask() {

        document.getElementById("vipOverlay")
            .classList.add("active");

        document.body.style.overflow = "hidden";
    }
    /* ==============================
       OPEN BILL
    =============================== */

    function openReward() {

        document.getElementById("rewardOverlay")
            .classList.add("active");

        document.body.style.overflow = "hidden";
    }
    /* ==============================
       OPEN BILL
    =============================== */

    
    /* ==============================
       OPEN BILL
    =============================== */

    function openManager() {

        document.getElementById("manageOverlay")
            .classList.add("active");

        document.body.style.overflow = "hidden";
    }
    /* ==============================
       OPEN BILL
    =============================== */


function openDownloadapp() {

        document.getElementById("appOverlay")
            .classList.add("active");

        document.body.style.overflow = "hidden";
}



    /* ==============================
       CLOSE POPUP WINDOWS
    =============================== */

    function closeWindow() {
        document.getElementById("withdrawOverlay")
            .classList.remove("active");
      document.getElementById("billOverlay")
            .classList.remove("active");
      document.getElementById("inviteOverlay")
            .classList.remove("active");document.getElementById("rewardOverlay")
            .classList.remove("active");document.getElementById("vipOverlay")
            .classList.remove("active");document.getElementById("manageOverlay")
  
            .classList.remove("active");document.getElementById("appOverlay")
            .classList.remove("active");document.getElementById("raffleOverlay")
            .classList.remove("active");document.getElementById("myteamoverlay")

        document.body.style.overflow = "";
    }

     function closeDeposit() {
        document.getElementById("depositOverlay")
            .classList.add("active");
        document.body.style.overflow = "";
     }

    function returnHome() {
      window.location.href = "user-account.html";
    }
    /* ==============================
       MOBILE MONEY TAB
    =============================== */

    function showMomo() {

        document.getElementById("momoTab")
            .classList.add("active");

        document.getElementById("usdtTab")
            .classList.remove("active");

        document.getElementById("momoSection")
            .classList.remove("hidden");

        document.getElementById("momoSection")
            .classList.add("active");

        document.getElementById("usdtSection")
            .classList.remove("active");
    }


    /* ==============================
       USDT TAB
    =============================== */

    function showUsdt() {

        document.getElementById("usdtTab")
            .classList.add("active");

        document.getElementById("momoTab")
            .classList.remove("active");

        document.getElementById("momoSection")
            .classList.add("hidden");

        document.getElementById("momoSection")
            .classList.remove("active");

        document.getElementById("usdtSection")
            .classList.add("active");
    }


    /* ==============================
       UPDATE AMOUNT DISPLAY
    =============================== */

    function updateAmount() {

        let amount =
            document.getElementById("amountInput").value;

        if (amount === "") {
            amount = "0.00";
        } else {
            amount =
                Number(amount).toLocaleString(
                    "en-US",
                    {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    }
                );
        }

        document.getElementById("amountDisplay")
            .textContent = amount;
    }




/* ==============================
   DEPOSIT ACTION AND LOGICS
=============================== */

function processDeposit() {
    // 1. Check active payment tab
    const usdtTab = document.getElementById("usdtTab");
    const isUsdtActive = usdtTab && usdtTab.classList.contains("active");

    // 2. Get input values
    const amount = document.getElementById("amountInput").value.trim();
    const phoneInput = document.getElementById("phoneNumber");
    const phone = phoneInput ? phoneInput.value.trim() : "";
  // Display the entered values in Step 1
document.getElementById("displayPhone").textContent = phone;
document.getElementById("displayAmount").textContent =
    "UGX " + Number(amount).toLocaleString();
document.getElementById("payment-text").textContent =
    "UGX " + Number(amount).toLocaleString();

    // 3. Process based on selected payment method
    if (isUsdtActive) {
        /* --------------------------
           USDT DEPOSIT LOGIC
        --------------------------- */
      
      

      goToPayment()

      
        console.log("Processing USDT Deposit:", { amount });

        closeDeposit();

    } else {
        /* --------------------------
           MOBILE MONEY (MTN / AIRTEL) LOGIC
        --------------------------- */
        if (phone === "") {
            alert("Please enter your MTN or Airtel number.");
            return;
        }

        if (amount === "" || Number(amount) <= 0) {
            alert("Please enter a valid deposit amount.");
            return;
        }
      closeDeposit();

        console.log("Processing Mobile Money Deposit:", { phone, amount });

        

        
    }
}




function goToPayment() {
        // 1. Get the value from the input
        const amount = document.getElementById("usdtcrypto-amount").value;
        
        // 2. Save it to sessionStorage (temporary browser storage)
        if(amount) {
            sessionStorage.setItem("tempUsdtAmount", amount);
        }

        // 3. Redirect to your second page (change 'page2.html' to your actual file name)
        window.location.href = "crypto_payment_confirmation.html";
}




document.addEventListener('DOMContentLoaded', () => {
  const popup = document.getElementById('fullscreen-popup');
  const closeBtn = document.getElementById('close-popup');
  const popupTitle = document.getElementById('popup-title');
  const popupTextbox = document.getElementById('popup-textbox');
  
  // ==========================================
  // 🛡️ SAFETY CHECK (Prevents crashes on other pages)
  // ==========================================
  // If any of these essential elements are missing on the current page, stop the script.
  if (!popup || !closeBtn || !popupTitle || !popupTextbox) {
      return; 
  }

  // ==========================================
  // ✏️ EDIT YOUR CUSTOM MESSAGES HERE
  // ==========================================
  const customMessages = {
      "msg-machine": " WisdomTree International AI Enhanced Value Fund* seeks income and capital appreciation by investing primarily in equity securities selected from a universe of developed market equities, excluding the United States and Canada, that exhibit value characteristics based on the selection results of a proprietary, quantitative artificial intelligence (AI) model developed by Voya Investment Management Co., LLC..",
      
      "msg-invite": "Gain dynamic core value exposure to developed market international equities with idiosyncratic alpha potential Use to complement or replace developed market international mid- and large capitalization core value allocations Use to satisfy demand for an actively managed value strategy driven by fundamentals and machine learning",
      
      "msg-team": "Firms in the United States attract the largest share of VC by a wide margin, comprising approximately 75% (UGX 2.01 billion) of global AI VC deal value, followed by the EU27 (6%, UGX 1.1 billion), the People’s Republic of China (hereafter ‘China’) (5%, UGX 1.9 billion), and the United Kingdom (5%, UGX 1.8 billion). United States VC investors also are the most active, representing about 56% (UGX 924 million) of the worldwide value of outgoing VC investments in AI in 2025, followed by investors in the United Kingdom at 9% (UGX 1.7 billion), China at 8% (UGX 1.2 billion) and EU27 investors at 7% (UGX 745.6 million). Since 2023, AI firms have attracted a declining share of early-stage VC relative to all funding rounds, possibly because capital is concentrating in “mega deals” of over UGX 100 million. Mega deals have continued to rise, comprising about 73% of total AI investment value in 2025.Since 2023, AI firms working on IT infrastructure and hosting attracted the most VC investment, overtaking other industries to reach a total of USD 47.4 billion in 2024 and UGX 509.3 billion in 2025, more than two-thirds as much as all other industries combined (UGX 749.4 million). Between 2012 and 2025, this comes to a cumulative UGX 256.1 million of investment, reflecting a rush to build AI compute infrastructure critical to scaling advanced AI systems. While long-term prospects for AI remain strong, investment markets are cyclical. These findings regarding past trends in AI VC should therefore be interpreted with caution in seeking to anticipate future trends.",
      
      "msg-vip": "United States: Dominates global AI spending, with cumulative private investments surpassing $471 billion through 2024 and annual private investment reaching roughly $285.9 billion in 2025. Focus areas include generative AI, semiconductor infrastructure, and national security.China: Ranks second globally, with cumulative private investments around $119 billion. Strategic focus areas target autonomous systems, smart manufacturing, and healthcare AI.United Kingdom & Europe: The UK accounts for roughly $28 billion in cumulative commitments focused on public services and AI safety. Major European nations like France and Germany direct substantial funds toward ethical frameworks, transport, and industrial automation.Asia-Pacific Beneficiaries: Countries like South Korea, Taiwan, and Japan capture significant hardware and semiconductor capital expenditures driven by US tech infrastructure demands",
      
      "msg-salary": "This information must be preceded or accompanied by a prospectus, click here to view or download prospectus. We advise you to consider the fund's objectives, risks, charges and expenses carefully before investing. The prospectus contains this and other important information about the fund. Please read the prospectus carefully before you invest.There are risks associated with investing, including possible loss of principal. Investments in non-U.S. securities involve political, regulatory, and economic risks that may not be present in U.S. securities. For example, foreign securities may be subject to risk of loss due to foreign currency fluctuations, political or economic instability, or geographic events that adversely impact issuers of foreign securities. Funds focusing their investments on certain sectors increase their vulnerability to any single economic or regulatory development. This may result in greater share price volatility. While the Fund is actively managed, the Fund’s investment process is heavily dependent on a quantitative model and the model may not perform as intended.."
  };
  // ==========================================

  const messageItems = document.querySelectorAll('.ite');

  // Loop through each item and add a click event
  messageItems.forEach(item => {
      item.addEventListener('click', function() {
          
          // 1. Get the title text and clean it (removes the "1: " part)
          const rawText = this.querySelector('.text').innerText;
          const cleanText = rawText.includes(': ') ? rawText.split(': ')[1] : rawText;
          
          // 2. Get the specific ID of the clicked item (e.g., "msg-machine")
          const clickedId = this.id;

          // 3. Look up the custom message from our dictionary above.
          const textToShow = customMessages[clickedId] || "Content coming soon...";
          
          // 4. Update the popup's title and text box content
          popupTitle.innerText = cleanText;
          popupTextbox.textContent = textToShow;
          
          // 5. Show the popup
          popup.style.display = 'flex';
      });
  });

  // Close popup when the X is clicked
  closeBtn.addEventListener('click', () => {
      popup.style.display = 'none';
  });

  // Close popup if user clicks anywhere outside the white box
  window.addEventListener('click', (event) => {
      if (event.target === popup) {
          popup.style.display = 'none';
      }
  });
});


//---------
//BILLING AREA LOGICS
////
