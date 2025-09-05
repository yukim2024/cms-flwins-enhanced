import { LightningElement } from "lwc";

export default class ProvideArrowFunctionalityToDropdown extends LightningElement {
    connectedCallback() {
        this.initializeDomAccess();
    }

    initializeDomAccess() {
        let dropdownButton;
        if (!import.meta.env.SSR) {
            // eslint-disable-next-line @lwc/lwc/no-document-query, @lwc/lwc/no-restricted-browser-globals-during-ssr
            dropdownButton = document.querySelector(
                ".slds-button--icon-border-filled"
            );
        }

        if (dropdownButton) {
            dropdownButton.setAttribute("role", "combobox");
            dropdownButton.setAttribute("aria-haspopup", "listbox");
            dropdownButton.setAttribute("aria-expanded", "false");
            dropdownButton.setAttribute("aria-label", "Action combo box, collapsed");
            // Attach click event listener to show the dropdown
            dropdownButton.addEventListener("click", () => {

                // Wait for the menu to be rendered
                // eslint-disable-next-line @lwc/lwc/no-async-operation
                setTimeout(() => {
                    this.initializeDropdownNavigation();
                }, 300);
            });
        } else {
            // console.log("Dropdown button not found. Retrying...");
            // eslint-disable-next-line @lwc/lwc/no-async-operation
            setTimeout(() => this.initializeDomAccess(), 4000); // Retry if not found
        }
    }

    initializeDropdownNavigation() {
        // Locate the dropdown menu after it's rendered
        let dropdownContainer;
        if (!import.meta.env.SSR) {
            // eslint-disable-next-line @lwc/lwc/no-document-query, @lwc/lwc/no-restricted-browser-globals-during-ssr
            dropdownContainer = document.querySelector(".scrollable");
        }

        if (!dropdownContainer) {
            // console.log("Dropdown menu not found.");
            // eslint-disable-next-line @lwc/lwc/no-async-operation
            setTimeout(() => this.initializeDropdownNavigation(), 1000);
        }

        // console.log("Dropdown menu detected. Adding keyboard support...");

        let menuItems = dropdownContainer.querySelectorAll(".uiMenuItem");
        // console.log("menuItems", menuItems);
        let currentIndex = -1;

        dropdownContainer.setAttribute("tabindex", "0"); // Make it focusable
        dropdownContainer.focus(); // Automatically focus to capture key events

        dropdownContainer.addEventListener("keydown", (event) => {
            if (menuItems.length === 0) return;

            // Remove the 'selected' class from all items before updating the selection
            menuItems.forEach((item) => item.style.fontWeight = "");

            if (event.key === "ArrowDown") {
                event.preventDefault();
                currentIndex = (currentIndex + 1) % menuItems.length;
            } else if (event.key === "ArrowUp") {
                event.preventDefault();
                currentIndex = (currentIndex - 1 + menuItems.length) % menuItems.length;
            } else if (event.key === "Enter") {
                event.preventDefault();
                menuItems[currentIndex].click(); // Simulate selection
                return;
            } else {
                return;
            }
            // Highlight the current item
            menuItems[currentIndex].style.fontWeight = "bold";
        });
    }
}