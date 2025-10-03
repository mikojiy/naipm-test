// ==UserScript==
// @name         NovelAI Prompt Profiles
// @namespace    http://tampermonkey.net/
// @author       Mikojiy
// @updateURL    https://raw.githubusercontent.com/mikojiy/naipm-test/main/NAIPM.user.js
// @downloadURL  https://raw.githubusercontent.com/mikojiy/naipm-test/main/NAIPM.user.js
// @version      2.5
// @description  Prompt profiles made easy for NovelAI.
// @match        https://novelai.github.io/image
// @grant        none
// ==/UserScript==
// ── Script Info ─────────────────────────────
// Repository: https://github.com/mikojiy/NAI-Profile-Manager
// ────────────────────────────────────────────

(function () {
    'use strict';
    document.documentElement.classList.add('dark');
    document.body.classList.add('dark');
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;
    const mobileFixStyle = document.createElement('style');
    mobileFixStyle.textContent = `
      /* Pastikan semua input dapat dipilih dan memunculkan keyboard di mobile */
      input, textarea, select {
        -webkit-user-select: text !important;
        -moz-user-select: text !important;
        -ms-user-select: text !important;
        user-select: text !important;
        pointer-events: auto !important;
      }

      /* Hapus outline default saat fokus */
      input:focus, textarea:focus, select:focus {
        outline: none !important;
        -webkit-appearance: none !important;
      }

      /* Perbaiki rendering untuk elemen di dalam modal dan panel */
      #nai-profiles-panel input, #nai-profiles-panel textarea, #nai-profiles-panel select,
      .modal input, .modal textarea, .modal select {
        -webkit-transform: translateZ(0) !important;
        transform: translateZ(0) !important;
      }

      /* Perbaiki responsive UI */
      @media (max-width: 768px) {
        .nai-responsive-text {
          font-size: 12px !important;
          white-space: nowrap !important;
          overflow: hidden !important;
          text-overflow: ellipsis !important;
        }
        .nai-responsive-button {
          font-size: 12px !important;
          padding: 8px 12px !important;
        }
        .nai-responsive-panel {
          width: 95% !important;
          max-width: 95% !important;
        }

        /* Mobile-specific button layout */
        .mobile-action-buttons {
          display: flex !important;
          gap: 8px !important;
          margin-bottom: 8px !important;
        }

        .mobile-action-buttons button {
          flex: 1 !important;
        }
      }

      /* Image Settings Styles - Updated for Compact Layout */
      .image-settings-container {
        background-color: #334155;
        border-radius: 6px;
        padding: 8px;
        margin-bottom: 1px;
      }

      .image-settings-row {
        display: flex;
        gap: 8px;
        align-items: center;
        justify-content: space-between;
        flex-wrap: nowrap;
        overflow-x: auto;
        padding: 4px 0;
      }

      .image-setting-item {
        display: flex;
        align-items: center;
        gap: 4px;
      }

      .image-setting-label {
        font-size: 12px;
        margin-right: 4px;
        opacity: 0.9;
      }

      .image-setting-input {
        padding: 4px;
        border-radius: 4px;
        border: 1px solid #475569;
        background: #1e293b;
        color: #e2e8f0;
        font-size: 12px;
        width: 40px;
      }

      @media (max-width: 768px) {
        .image-settings-row {
          font-size: 12px !important;
          justify-content: space-between !important;
        }

        .image-setting-input {
          width: 50px !important;
          font-size: 12px !important;
        }
      }
    `;
    document.head.appendChild(mobileFixStyle);

    const STRINGS = {
        ready: "Ready to go 🎯",
        profilesTitle: "Prompt Profiles",
        manageGlobalVars: "Manage Global Variables",
        manageWildcards: "Manage Wildcards",
        settingsBlacklist: "Settings & Blacklist",
        positivePlaceholder: "Positive prompt...",
        negativePlaceholder: "Negative prompt (Undesired Content)...",
        override: "🔄 Override",
        append: "➕ Append",
        newProfile: "🆕 New",
        saveProfile: "💾 Save",
        renameProfile: "✏️ Rename",
        deleteProfile: "🗑️ Delete",
        clearAll: "💥 Clear",
        swapPosition: "🔁 Swap Pos",
        danbooru: "🔍 Danbooru",
        fullBackup: "📦 Full Backup",
        fullRestore: "🔁 Full Restore",
        searchProfiles: "🔍 Search",
        noProfiles: "No profiles yet",
        enterProfileName: "Name your new profile:",
        profileExists: name => `❌ "${name}" already exists.`,
        createdProfile: name => `✅ Created "${name}".`,
        pickProfileFirst: "❌ Pick a profile first.",
        savedProfile: name => `✔️ "${name}" saved.`,
        renamePrompt: "New name:",
        renameTaken: name => `❌ "${name}" already taken.`,
        renamed: (old, neu) => `🔄 Renamed "${old}" → "${neu}"`,
        confirmDelete: name => `Delete "${name}"?`,
        deletedSwitched: (del, newp) => `🗑️ Deleted "${del}". Switched to "${newp}".`,
        deletedNone: name => `🗑️ Deleted "${name}". No profiles left.`,
        confirmClearAll: "⚠️ Delete ALL profiles? This can't be undone.",
        clearedAll: "🧹 Cleared everything.",
        swapPrompt: "Swap with which profile number?",
        invalidPos: "❌ Invalid position.",
        alreadyThere: "ℹ️ Already there.",
        swapped: (pos1, pos2) => `✅ Swapped profile #${pos1} with profile #${pos2}.`,
        danbooruPrompt: (last) => `📌 Pull prompt from Danbooru
Enter post ID (like: 789532)
Last used: ${last || 'None'}`,
        danbooruInvalidId: "❌ ID must be numbers only.",
        danbooruFetching: id => `📥 Fetching Danbooru #${id}...`,
        danbooruApplying: id => `🔧 Applying prompt from Danbooru #${id}...`,
        danbooruApplyFail: "❌ Failed to send to editor.",
        danbooruError: err => `❌ Danbooru: ${err}`,
        backupSaved: "✅ Full backup saved!",
        restoreSelectFile: "Select backup file (.json)",
        restoreSuccess: "✅ Full backup restored!",
        restoreLegacy: "🔄 Loaded legacy profiles.",
        restoreInvalid: "❌ Not a valid backup file.",
        globalVarsTitle: "🔤 Global Variables",
        globalVarsDesc: "Format: <code>name=value</code><br>Example: <code>miku=twintail, blue hair, aqua eyes</code>",
        wildcardsTitle: "🎲 Wildcards",
        wildcardsDesc: "Format: <code>name=value1, value2, ...</code><br>Example: <code>character=miku, teto, luka</code>",
        blacklistTitle: "⚙️ Tag Blacklist",
        blacklistDesc: "Tags below will be removed when fetching from Danbooru. Separate with commas.",
        blacklistPlaceholder: "white background, outdoors, upper body, text, watermark",
        blacklistSaved: count => `✅ Blacklist updated (${count} tags).`,
        nothingToPaste: "⚠️ Nothing to paste here.",
        cantFindEditor: "❌ Can't find the editor.",
        doneProseMirror: "✅ Done (ProseMirror)",
        fallbackMethod: "⚠️ That didn't work, trying another way...",
        pasted: "✅ Pasted!",
        clipboardCopy: "📋 Copied! Just hit Ctrl+V to paste it yourself.",
        clipboardFail: "❌ Couldn't copy to clipboard.",
        nothingToAppend: "⚠️ Nothing to append.",
        appendedProseMirror: "✅ Appended (ProseMirror)",
        appendFallback: "⚠️ Append fallback...",
        appended: "✅ Appended!",
        appendClipboard: "📋 Copied! Paste manually.",
        nothingToAppendNeg: "⚠️ Nothing to append (negative).",
        negAppendedProseMirror: "✅ Negative appended (ProseMirror)",
        negAppendFallback: "⚠️ Negative append clipboard fallback...",
        negAppended: "✅ Negative appended!",
        fillVarsTitle: "Fill Variables & Wildcards",
        fillVarsLabel: "Fill values for variables:",
        wildcardChoose: "-- Choose --",
        dbLabel: "DB (Danbooru ID)",
        dbPlaceholder: "789532",
        dbDesc: "Enter a post ID from Danbooru",
        cancel: "Cancel",
        apply: "Apply",
        updateAvailable: "🎉 Update Available!",
        updateCurrent: "You're on <strong>v3.6.3</strong>.",
        updateNew: vers => `Version <strong>v${vers}</strong> is out.`,
        updateNow: "Update Now",
        addCharacter: "Add Character",
        editCharacter: "Edit Character",
        charNameLabel: "Character Name:",
        charPromptLabel: "Character Prompt:",
        charNamePlaceholder: "e.g. Miku",
        charPromptPlaceholder: "girl, blue hair, twintail...",
        removeCharacter: "Remove",
        moveUp: "Move Up",
        moveDown: "Move Down",
        noCharacters: "No characters yet",
        maxCharsWarning: (found, available) => `⚠️ Found ${found} characters, but only ${available} slots available. Some will be skipped.`,
        fillVariablesTitle: "Fill Variables",
        fillVariablesDesc: "Please fill in the values for the variables found in your prompt:",
        fillWildcardsTitle: "Select Wildcards",
        fillWildcardsDesc: "Please select values for the wildcards found in your prompt:",
        fillCharVarsTitle: "Character Variables & Wildcards",
        fillCharVarsDesc: "Fill in values for variables and select wildcards for character prompts:",
        generate: "🎨 Generate Image",
        profileTab: "Profile",
        characterTab: "Character",
        utilityTab: "Utility",
        settingsTab: "Settings",
        close: "✕ Close",
        selectChar: "Select a character...",
        searchCharDB: "Search character database...",
        addSelected: "Add Selected",
        noCharsFound: "No characters found",
        editCharDB: "Edit",
        notificationSettings: "Notification Settings",
        enableNotifications: "🔔Notifications",
        notificationDesc: "Show success/error messages on screen.",
        deleteCharDB: "Delete",
        organizeCharDB: "Organize",
        organizeCharDBTitle: "Organize Character Database",
        searchCharsPlaceholder: "Search characters...",
        editChar: "Edit",
        renameChar: "Rename",
        deleteChar: "Delete",
        confirmDeleteChar: name => `Delete "${name}" from database?`,
        charDeleted: name => `Deleted "${name}" from database`,
        charRenamed: (old, neu) => `Renamed "${old}" to "${neu}"`,
        // New strings for image settings
        steps: "steps",
        guidance: "guidance",
        applySettings: "Apply Settings",
        imageSettings: "Image Generation Settings"
    };
    const t = (key, ...args) => {
        const str = STRINGS[key] || key;
        if (typeof str === 'function') return str(...args);
        return str;
    };
    const STORAGE_KEY = "nai_prompt_profiles_v2";
    const LAST_PROFILE_KEY = "nai_last_profile";
    const ICON_POS_KEY = "nai_icon_position";
    const BLACKLIST_KEY = "nai_danbooru_blacklist";
    const LAST_ID_KEY = "nai_last_danbooru_id";
    const GLOBAL_VARIABLES_KEY = "nai_global_variables";
    const WILDCARDS_KEY = "nai_wildcards";
    const WILDCARD_REMAINING_KEY = "nai_wildcard_remaining";
    const CHARACTER_DB_KEY = "nai_character_database";
    const NOTIFICATION_SETTINGS_KEY = "nai_notification_settings";
    // New storage key for image settings
    const IMAGE_SETTINGS_KEY = "nai_image_settings";

    let profiles = [];
    let lastProfileName = localStorage.getItem(LAST_PROFILE_KEY);
    let lastId = localStorage.getItem(LAST_ID_KEY) || "";
    let blacklistTags = [];
    let globalVariables = {};
    let wildcards = {};
    let wildcardRemaining = {};
    let characterDatabase = {};
    let enableNotifications = true;

    // Default image settings
    let imageSettings = {
        steps: 28,
        guidance: 5.0
    };

    // Load image settings from storage
    try {
        const saved = localStorage.getItem(IMAGE_SETTINGS_KEY);
        if (saved) {
            const loaded = JSON.parse(saved);
            imageSettings = { ...imageSettings, ...loaded };
        }
    } catch (e) {
        console.error("Failed to load image settings:", e);
    }

    // Save image settings to storage
    function saveImageSettings() {
        localStorage.setItem(IMAGE_SETTINGS_KEY, JSON.stringify(imageSettings));
    }

// Apply image settings by simulating user interaction more accurately
function applyImageSettings() {

    // Find the input elements
    let stepsInput = null;
    let guidanceInput = null;

    const allContainers = document.querySelectorAll('.image__ASDetail-sc-5d63727e-15');
    allContainers.forEach(container => {
        if (container.textContent.includes('Steps')) {
            stepsInput = container.querySelector('input[type="number"][step="1"]');
        } else if (container.textContent.includes('Guidance')) {
            guidanceInput = container.querySelector('input[type="number"][step="0.1"]');
        }
    });

    // Function to simulate user interaction
    function simulateUserInteraction(input, value) {
        if (!input) return;

        // Make sure the value is a string
        const valueStr = String(value);

        // Focus the input
        input.focus();

        // Select all text
        input.select();

        // Clear the input
        document.execCommand('insertText', false, '');

        // Type the new value character by character
        for (let i = 0; i < valueStr.length; i++) {
            const char = valueStr[i];
            document.execCommand('insertText', false, char);
        }

        // Blur the input
        input.blur();

        // Check if the value was actually updated
        setTimeout(() => {
        }, 100);
    }

    // Apply the settings
    if (stepsInput) {
        simulateUserInteraction(stepsInput, imageSettings.steps);
    } else {
    }

    if (guidanceInput) {
        simulateUserInteraction(guidanceInput, imageSettings.guidance);
    } else {
        console.error("Could not find Guidance input element");
    }

    showNotification("✅ Image settings applied", 'success');
}

    try { const saved = localStorage.getItem(STORAGE_KEY); if (saved) profiles = JSON.parse(saved).filter(p => p && p.name).map(p => ({...p, characters: Array.isArray(p.characters) ? p.characters : [] })); } catch (e) {}
    try { blacklistTags = (localStorage.getItem(BLACKLIST_KEY) || "").split(',').map(t => t.trim().toLowerCase()).filter(t => t); } catch (e) {}
    try { globalVariables = JSON.parse(localStorage.getItem(GLOBAL_VARIABLES_KEY) || "{}"); } catch (e) {}
    try { wildcards = JSON.parse(localStorage.getItem(WILDCARDS_KEY) || "{}"); } catch (e) {}
    try { wildcardRemaining = JSON.parse(localStorage.getItem(WILDCARD_REMAINING_KEY) || "{}"); } catch (e) {}
    try { characterDatabase = JSON.parse(localStorage.getItem(CHARACTER_DB_KEY) || "{}"); } catch (e) {}
    try { enableNotifications = JSON.parse(localStorage.getItem(NOTIFICATION_SETTINGS_KEY) || "true"); } catch (e) {}
    function saveToStorage() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
        localStorage.setItem(BLACKLIST_KEY, blacklistTags.join(', '));
        localStorage.setItem(GLOBAL_VARIABLES_KEY, JSON.stringify(globalVariables));
        localStorage.setItem(WILDCARDS_KEY, JSON.stringify(wildcards));
        localStorage.setItem(WILDCARD_REMAINING_KEY, JSON.stringify(wildcardRemaining));
        localStorage.setItem(CHARACTER_DB_KEY, JSON.stringify(characterDatabase));
    }
    function setLastProfile(name) {
        lastProfileName = name;
        localStorage.setItem(LAST_PROFILE_KEY, name);
    }
    function getThemeColors() {
        return {
            background: '#1e293b',
            color: '#e2e8f0',
            borderColor: '#334155',
            inputBackground: '#334155',
            inputColor: '#e2e8f0',
            buttonBackground: '#3b82f6',
            buttonHover: '#2563eb',
            deleteBackground: '#ef4444',
            deleteHover: '#dc2626',
            charListBackground: '#1e293b',
            charListColor: '#e2e8f0',
            charListBorder: '#334155',
            charItemBackground: '#334155',
            charItemColor: '#e2e8f0',
            charItemHover: '#475569',
            successBg: '#065f46',
            successBorder: '#047857',
            errorBg: '#7f1d1d',
            errorBorder: '#b91c1c',
            infoBg: '#1e3a8a',
            infoBorder: '#2563eb'
        };
    }
    function updateSelectOptions(select, selectedName = null, filteredProfiles = null) {
        select.innerHTML = "";
        const profilesToUse = filteredProfiles || profiles;
        if (profilesToUse.length === 0) {
            const opt = document.createElement("option");
            opt.value = ""; opt.textContent = t('noProfiles'); opt.disabled = true; select.appendChild(opt);
            return;
        }
        profilesToUse.forEach((p) => {
            const opt = document.createElement("option");
            opt.value = p.name;
            const originalIndex = profiles.findIndex(profile => profile.name === p.name);
            opt.textContent = `${originalIndex + 1}. ${p.name}`;
            select.appendChild(opt);
        });
        if (selectedName && profilesToUse.some(p => p.name === selectedName)) {
            select.value = selectedName;
        } else if (profilesToUse.length > 0) {
            select.selectedIndex = 0;
        }
    }
    function findPositiveEditor() {
        return document.querySelector('.image-gen-prompt-main .ProseMirror') ||
               document.querySelector('.prompt-input-box-prompt .ProseMirror');
    }
    function findNegativeEditor() {
        return document.querySelector('.prompt-input-box-undesired-content .ProseMirror');
    }
    function findPMView(node, maxDepth = 6) {
        let el = node;
        let depth = 0;
        while (el && depth < maxDepth) {
            try {
                const maybeKeys = Object.keys(el);
                for (const k of maybeKeys) {
                    try {
                        const v = el[k];
                        if (v && typeof v === 'object' && v.state && typeof v.dispatch === 'function') {
                            return v;
                        }
                    } catch (e) {}
                }
                if (el.pmView) return el.pmView;
                if (el.__pmView) return el.__pmView;
                if (el._pmView) return el._pmView;
                if (el.__view) return el.__view;
                if (el._view) return el._view;
            } catch (e) {}
            el = el.parentNode;
            depth++;
        }
        return null;
    }
    function extractVariables(text) {
        const variables = [];
        const regex = /{([^{}]+)}/g;
        let match;
        while ((match = regex.exec(text)) !== null) {
            const key = match[1];
            if (key !== "DB" && !variables.includes(key)) {
                variables.push(key);
            }
        }
        return variables;
    }
    function extractWildcards(text) {
        const wildcards = [];
        const regex = /\[([^\[\]]+)\]/g;
        let match;
        while ((match = regex.exec(text)) !== null) {
            const key = match[1];
            if (!wildcards.includes(key)) {
                wildcards.push(key);
            }
        }
        return wildcards;
    }
    function replaceGlobalVariables(text) {
        if (!text) return text;
        let result = text;
        const regex = /{([^{}]+)}/g;
        let match;
        while ((match = regex.exec(result)) !== null) {
            const key = match[1];
            if (key === "DB") continue;
            if (globalVariables[key] !== undefined) {
                const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                const pattern = new RegExp(`{${escapedKey}}`, 'g');
                result = result.replace(pattern, globalVariables[key]);
            }
        }
        return result;
    }
    function resolveWildcard(content) {
        const regex = /\[([^\[\]]+)\]/g;
        let match;
        let result = content;
        while ((match = regex.exec(content)) !== null) {
            const key = match[1];
            const options = wildcards[key] || [];
            if (options.length === 0) continue;
            let remaining = wildcardRemaining[key] || [...options];
            if (remaining.length === 0) remaining = [...options];
            const chosen = remaining.shift();
            wildcardRemaining[key] = remaining;
            const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const pattern = new RegExp(`\\[${escapedKey}\\]`, 'g');
            result = result.replace(pattern, chosen);
        }
        return result;
    }
    function showNotification(message, type = 'info') {
            if (!enableNotifications) return;
        const colors = getThemeColors();
        let bgColor, borderColor;
        switch(type) {
            case 'success': bgColor = colors.successBg; borderColor = colors.successBorder; break;
            case 'error': bgColor = colors.errorBg; borderColor = colors.errorBorder; break;
            default: bgColor = colors.infoBg; borderColor = colors.infoBorder; break;

        }
        const notification = document.createElement('div');
        Object.assign(notification.style, {
            position: 'fixed', top: "20px", right: "20px",
            padding: '12px 16px', backgroundColor: bgColor, color: colors.color,
            border: `1px solid ${borderColor}`, borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: '30000',
            maxWidth: isMobile ? '80%' : '300px', fontSize: '14px', fontFamily: 'sans-serif',
            boxSizing: 'border-box', transform: 'translateX(120%)',
            transition: 'transform 0.3s ease-out'
        });
        notification.textContent = message;
        document.body.appendChild(notification);
        setTimeout(() => notification.style.transform = 'translateX(0)', 10);
        setTimeout(() => {
            notification.style.transform = 'translateX(120%)';
            setTimeout(() => { if (notification.parentNode) document.body.removeChild(notification); }, 300);
        }, 3000);
    }
    function showVariableWildcardDialog(text, callback, isCharacter = false) {
        const variables = extractVariables(text);
        const extractedWildcards = extractWildcards(text);
        const wildcardsList = extractedWildcards.filter(key => {
            const options = wildcards[key];
            return Array.isArray(options) && options.length > 0;
        });
        const undefVars = variables.filter(v => globalVariables[v] === undefined);
        if (undefVars.length === 0 && wildcardsList.length === 0) {
            const processedText = replaceGlobalVariables(text);
            callback(processedText);
            return;
        }
        if (undefVars.length === 0 && wildcardsList.length > 0) {
            showWildcardOnlyDialog(text, callback, isCharacter);
            return;
        }
        const colors = getThemeColors();
        const modal = document.createElement('div');
        modal.id = 'nai-variable-wildcard-modal';
        Object.assign(modal.style, {
            position: 'fixed', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)', width: isMobile ? '90%' : '500px', maxWidth: '90vw',
            background: colors.background, color: colors.color,
            border: `1px solid ${colors.borderColor}`, borderRadius: '12px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.2)', zIndex: '20000',
            padding: '20px', fontFamily: 'sans-serif', boxSizing: 'border-box',
            display: 'flex', flexDirection: 'column', maxHeight: isMobile ? '85vh' : '80vh'
        });
        const contentArea = document.createElement('div');
        contentArea.style.flex = '1';
        contentArea.style.overflowY = 'auto';
        contentArea.style.marginBottom = '16px';

        let modalHTML = '';
        if (undefVars.length > 0) {
            modalHTML += `
                <div style="font-weight:bold; font-size:16px; margin-bottom:16px;">${t('fillVariablesTitle')}</div>
                <div style="font-size:13px; margin-bottom:16px; opacity:0.9;">${t('fillVariablesDesc')}</div>
                <div style="margin-bottom:20px;">
            `;
            undefVars.forEach(variable => {
                const currentValue = globalVariables[variable] || '';
                modalHTML += `
                    <div style="margin-bottom:12px;">
                        <label style="display:block; font-size:13px; margin-bottom:4px; opacity:0.9;">{${variable}}:</label>
                        <input type="text" id="var-${variable}"
                               value="${currentValue}"
                               placeholder="Enter value for ${variable}"
                               style="width:100%; padding:8px; border-radius:6px; border:1px solid ${colors.borderColor};
                                      background:${colors.inputBackground}; color:${colors.inputColor}; font-size:13px;" />
                    </div>
                `;
            });
            modalHTML += '</div>';
        }
        if (wildcardsList.length > 0) {
            modalHTML += `
                <div style="font-weight:bold; font-size:16px; margin-bottom:16px;">${t('fillWildcardsTitle')}</div>
                <div style="font-size:13px; margin-bottom:16px; opacity:0.9;">${t('fillWildcardsDesc')}</div>
                <div style="margin-bottom:20px;">
            `;
            wildcardsList.forEach(wildcard => {
                const options = wildcards[wildcard] || [];
                let optionsHtml = '<option value="__random__">🎲 Random</option>';
                options.forEach(opt => {
                    optionsHtml += `<option value="${opt}">${opt}</option>`;
                });
                modalHTML += `
                    <div style="margin-bottom:12px;">
                        <label style="display:block; font-size:13px; margin-bottom:4px; opacity:0.9;">[${wildcard}]:</label>
                        <select id="wildcard-${wildcard}"
                                style="width:100%; padding:8px; border-radius:6px; border:1px solid ${colors.borderColor};
                                       background:${colors.inputBackground}; color:${colors.inputColor}; font-size:13px;">
                            ${optionsHtml}
                        </select>
                    </div>
                `;
            });
            modalHTML += '</div>';
        }
        contentArea.innerHTML = modalHTML;
        const buttonArea = document.createElement('div');
        buttonArea.style.display = 'flex';
        buttonArea.style.gap = '8px';
        buttonArea.style.justifyContent = 'flex-end';
        buttonArea.style.paddingTop = '16px';
        buttonArea.style.borderTop = `1px solid ${colors.borderColor}`;

        const cancelBtn = document.createElement('button');
        cancelBtn.id = 'cancel-vars';
        cancelBtn.textContent = t('cancel');
        Object.assign(cancelBtn.style, {
            padding: '6px 12px', background: colors.deleteBackground, color: 'white', border: 'none',
            borderRadius: '6px', cursor: 'pointer'
        });

        const applyBtn = document.createElement('button');
        applyBtn.id = 'apply-vars';
        applyBtn.textContent = t('apply');
        Object.assign(applyBtn.style, {
            padding: '6px 12px', background: colors.buttonBackground, color: 'white', border: 'none',
            borderRadius: '6px', cursor: 'pointer', zIndex: '20001'
        });

        buttonArea.appendChild(cancelBtn);
        buttonArea.appendChild(applyBtn);
        modal.appendChild(contentArea);
        modal.appendChild(buttonArea);

        document.body.appendChild(modal);

        const cancelBtnClick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            document.body.removeChild(modal);
        };
        const applyBtnClick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            let resultText = text;
            undefVars.forEach(variable => {
                const input = modal.querySelector(`#var-${variable}`);
                const value = input.value.trim();
                if (value) {
                    const escapedKey = variable.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                    const pattern = new RegExp(`{${escapedKey}}`, 'g');
                    resultText = resultText.replace(pattern, value);
                }
            });
            wildcardsList.forEach(wildcard => {
                const select = modal.querySelector(`#wildcard-${wildcard}`);
                const value = select.value;
                if (value === "__random__") {
                    const options = wildcards[wildcard] || [];
                    if (options.length > 0) {
                        let remaining = wildcardRemaining[wildcard] || [...options];
                        if (remaining.length === 0) remaining = [...options];
                        const chosen = remaining.shift();
                        wildcardRemaining[wildcard] = remaining;
                        const escapedKey = wildcard.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                        const pattern = new RegExp(`\\[${escapedKey}\\]`, 'g');
                        resultText = resultText.replace(pattern, chosen);
                    }
                } else if (value) {
                    const escapedKey = wildcard.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                    const pattern = new RegExp(`\\[${escapedKey}\\]`, 'g');
                    resultText = resultText.replace(pattern, value);
                }
            });
            resultText = replaceGlobalVariables(resultText);
            localStorage.setItem(WILDCARD_REMAINING_KEY, JSON.stringify(wildcardRemaining));
            document.body.removeChild(modal);
            callback(resultText);
        };

        cancelBtn.onclick = cancelBtnClick;
        cancelBtn.addEventListener('touchend', cancelBtnClick, { passive: false });
        applyBtn.onclick = applyBtnClick;
        applyBtn.addEventListener('touchend', applyBtnClick, { passive: false });

        modal.addEventListener('click', e => {
            if (e.target === modal) {
                e.preventDefault();
                e.stopPropagation();
                document.body.removeChild(modal);
            }
        });
    }
    function showWildcardOnlyDialog(text, callback, isCharacter = false) {
        const extractedWildcards = extractWildcards(text);
        const wildcardsList = extractedWildcards.filter(key => {
            const options = wildcards[key];
            return Array.isArray(options) && options.length > 0;
        });
        const colors = getThemeColors();
        const modal = document.createElement('div');
        modal.id = 'nai-wildcard-only-modal';
        Object.assign(modal.style, {
            position: 'fixed', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)', width: isMobile ? '90%' : '500px', maxWidth: '90vw',
            background: colors.background, color: colors.color,
            border: `1px solid ${colors.borderColor}`, borderRadius: '12px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.2)', zIndex: '20000',
            padding: '20px', fontFamily: 'sans-serif', boxSizing: 'border-box',
            display: 'flex', flexDirection: 'column', maxHeight: isMobile ? '85vh' : '80vh'
        });
        const contentArea = document.createElement('div');
        contentArea.style.flex = '1';
        contentArea.style.overflowY = 'auto';
        contentArea.style.marginBottom = '16px';

        let modalHTML = `
            <div style="font-weight:bold; font-size:16px; margin-bottom:16px;">${t('fillWildcardsTitle')}</div>
            <div style="font-size:13px; margin-bottom:16px; opacity:0.9;">${t('fillWildcardsDesc')}</div>
            <div style="margin-bottom:20px;">
        `;
        wildcardsList.forEach(wildcard => {
            const options = wildcards[wildcard] || [];
            let optionsHtml = '<option value="__random__">🎲 Random</option>';
            options.forEach(opt => {
                optionsHtml += `<option value="${opt}">${opt}</option>`;
            });
            modalHTML += `
                <div style="margin-bottom:12px;">
                    <label style="display:block; font-size:13px; margin-bottom:4px; opacity:0.9;">[${wildcard}]:</label>
                    <select id="wildcard-${wildcard}"
                            style="width:100%; padding:8px; border-radius:6px; border:1px solid ${colors.borderColor};
                                   background:${colors.inputBackground}; color:${colors.inputColor}; font-size:13px;">
                        ${optionsHtml}
                    </select>
                </div>
            `;
        });
        modalHTML += '</div>';
        contentArea.innerHTML = modalHTML;
        const buttonArea = document.createElement('div');
        buttonArea.style.display = 'flex';
        buttonArea.style.gap = '8px';
        buttonArea.style.justifyContent = 'flex-end';
        buttonArea.style.paddingTop = '16px';
        buttonArea.style.borderTop = `1px solid ${colors.borderColor}`;

        const cancelBtn = document.createElement('button');
        cancelBtn.id = 'cancel-wildcard';
        cancelBtn.textContent = t('cancel');
        Object.assign(cancelBtn.style, {
            padding: '6px 12px', background: colors.deleteBackground, color: 'white', border: 'none',
            borderRadius: '6px', cursor: 'pointer'
        });

        const applyBtn = document.createElement('button');
        applyBtn.id = 'apply-wildcard';
        applyBtn.textContent = t('apply');
        Object.assign(applyBtn.style, {
            padding: '6px 12px', background: colors.buttonBackground, color: 'white', border: 'none',
            borderRadius: '6px', cursor: 'pointer', zIndex: '20001'
        });

        buttonArea.appendChild(cancelBtn);
        buttonArea.appendChild(applyBtn);
        modal.appendChild(contentArea);
        modal.appendChild(buttonArea);

        document.body.appendChild(modal);

        const cancelBtnClick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            document.body.removeChild(modal);
        };
        const applyBtnClick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            let resultText = text;
            wildcardsList.forEach(wildcard => {
                const select = modal.querySelector(`#wildcard-${wildcard}`);
                const value = select.value;
                if (value === "__random__") {
                    const options = wildcards[wildcard] || [];
                    if (options.length > 0) {
                        let remaining = wildcardRemaining[wildcard] || [...options];
                        if (remaining.length === 0) remaining = [...options];
                        const chosen = remaining.shift();
                        wildcardRemaining[wildcard] = remaining;
                        const escapedKey = wildcard.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                        const pattern = new RegExp(`\\[${escapedKey}\\]`, 'g');
                        resultText = resultText.replace(pattern, chosen);
                    }
                } else if (value) {
                    const escapedKey = wildcard.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                    const pattern = new RegExp(`\\[${escapedKey}\\]`, 'g');
                    resultText = resultText.replace(pattern, value);
                }
            });
            resultText = replaceGlobalVariables(resultText);
            localStorage.setItem(WILDCARD_REMAINING_KEY, JSON.stringify(wildcardRemaining));
            document.body.removeChild(modal);
            callback(resultText);
        };

        cancelBtn.onclick = cancelBtnClick;
        cancelBtn.addEventListener('touchend', cancelBtnClick, { passive: false });
        applyBtn.onclick = applyBtnClick;
        applyBtn.addEventListener('touchend', applyBtnClick, { passive: false });

        modal.addEventListener('click', e => {
            if (e.target === modal) {
                e.preventDefault();
                e.stopPropagation();
                document.body.removeChild(modal);
            }
        });
    }
    async function applyTextToEditor(text, statusEl) {
        if (!text?.trim()) {
            showNotification(t('nothingToPaste'), 'error');
            return false;
        }
        showVariableWildcardDialog(text, async (processedText) => {
            const editor = findPositiveEditor();
            if (!editor) {
                showNotification(t('cantFindEditor'), 'error');
                return false;
            }
            const view = findPMView(editor);
            if (view) {
                try {
                    const tr = view.state.tr;
                    tr.delete(0, view.state.doc.content.size);
                    tr.insertText(processedText);
                    view.dispatch(tr);
                    showNotification(t('doneProseMirror'), 'success');
                    return true;
                } catch (e) {
                    await new Promise(r => setTimeout(r, 100));
                    try {
                        const tr = view.state.tr;
                        tr.delete(0, view.state.doc.content.size);
                        tr.insertText(processedText);
                        view.dispatch(tr);
                        showNotification(t('doneProseMirror'), 'success');
                        return true;
                    } catch (e2) {
                        console.error("Retry failed:", e2);
                        showNotification(t('fallbackMethod'), 'error');
                    }
                }
            }
            try {
                editor.focus();
                const range = document.createRange();
                range.selectNodeContents(editor);
                const sel = window.getSelection();
                sel.removeAllRanges();
                sel.addRange(range);
                const okIns = document.execCommand('insertText', false, processedText);
                editor.dispatchEvent(new InputEvent('input', { bubbles: true }));
                editor.dispatchEvent(new Event('change', { bubbles: true }));
                if (okIns) {
                    showNotification(t('pasted'), 'success');
                    return true;
                }
            } catch (e) {
                console.error("execCommand error:", e);
                showNotification(t('clipboardCopy'), 'info');
            }
            try {
                await navigator.clipboard.writeText(processedText);
                showNotification(t('clipboardCopy'), 'info');
                return false;
            } catch (e) {
                console.error("Clipboard error:", e);
                showNotification(t('clipboardFail'), 'error');
                return false;
            }
        });
        return true;
    }
    async function applyTextToNegativeEditor(text, statusEl) {
        if (!text?.trim()) {
            showNotification(t('nothingToPasteNeg'), 'error');
            return false;
        }
        showVariableWildcardDialog(text, async (processedText) => {
            const editor = findNegativeEditor();
            if (!editor) {
                showNotification(t('cantFindNegEditor'), 'error');
                return false;
            }
            const view = findPMView(editor);
            if (view) {
                try {
                    const tr = view.state.tr;
                    tr.delete(0, view.state.doc.content.size);
                    tr.insertText(processedText);
                    view.dispatch(tr);
                    showNotification(t('doneNegProseMirror'), 'success');
                    return true;
                } catch (e) {
                    await new Promise(r => setTimeout(r, 100));
                    try {
                        const tr = view.state.tr;
                        tr.delete(0, view.state.doc.content.size);
                        tr.insertText(processedText);
                        view.dispatch(tr);
                        showNotification(t('doneNegProseMirror'), 'success');
                        return true;
                    } catch (e2) {
                        console.error("Retry failed:", e2);
                        showNotification(t('negFallback'), 'error');
                    }
                }
            }
            try {
                editor.focus();
                const range = document.createRange();
                range.selectNodeContents(editor);
                const sel = window.getSelection();
                sel.removeAllRanges();
                sel.addRange(range);
                const okIns = document.execCommand('insertText', false, processedText);
                editor.dispatchEvent(new InputEvent('input', { bubbles: true }));
                editor.dispatchEvent(new Event('change', { bubbles: true }));
                if (okIns) {
                    showNotification(t('negPasted'), 'success');
                    return true;
                }
            } catch (e) {
                console.error("Negative execCommand error:", e);
                showNotification(t('negClipboard'), 'info');
            }
            try {
                await navigator.clipboard.writeText(processedText);
                showNotification(t('negClipboard'), 'info');
                return false;
            } catch (e) {
                console.error("Negative clipboard error:", e);
                showNotification(t('negClipboardFail'), 'error');
                return false;
            }
        });
        return true;
    }
    async function applyTextToEditorAppend(text, statusEl) {
        if (!text?.trim()) {
            showNotification(t('nothingToAppend'), 'error');
            return false;
        }
        showVariableWildcardDialog(text, async (processedText) => {
            const editor = findPositiveEditor();
            if (!editor) {
                showNotification(t('cantFindEditor'), 'error');
                return false;
            }
            let currentText = "";
            const view = findPMView(editor);
            if (view) {
                currentText = view.state.doc.textContent;
            } else {
                currentText = editor.textContent || "";
            }
            currentText = currentText.trim();
            let finalText = processedText.trim();
            if (currentText) {
                if (!currentText.endsWith(',')) currentText += ',';
                if (!finalText.startsWith(' ')) finalText = ' ' + finalText;
                finalText = currentText + finalText;
            }
            if (view) {
                try {
                    const tr = view.state.tr;
                    tr.delete(0, view.state.doc.content.size);
                    tr.insertText(finalText);
                    view.dispatch(tr);
                    showNotification(t('appendedProseMirror'), 'success');
                    return true;
                } catch (e) {
                    await new Promise(r => setTimeout(r, 100));
                    try {
                        const tr = view.state.tr;
                        tr.delete(0, view.state.doc.content.size);
                        tr.insertText(finalText);
                        view.dispatch(tr);
                        showNotification(t('appendedProseMirror'), 'success');
                        return true;
                    } catch (e2) {
                        console.error("Retry failed:", e2);
                        showNotification(t('appendFallback'), 'error');
                    }
                }
            }
            try {
                editor.focus();
                const range = document.createRange();
                range.selectNodeContents(editor);
                const sel = window.getSelection();
                sel.removeAllRanges();
                sel.addRange(range);
                const okIns = document.execCommand('insertText', false, finalText);
                editor.dispatchEvent(new InputEvent('input', { bubbles: true }));
                editor.dispatchEvent(new Event('change', { bubbles: true }));
                if (okIns) {
                    showNotification(t('appended'), 'success');
                    return true;
                }
            } catch (e) {
                console.error("execCommand append error:", e);
                showNotification(t('appendClipboard'), 'info');
            }
            try {
                await navigator.clipboard.writeText(finalText);
                showNotification(t('appendClipboard'), 'info');
                return false;
            } catch (e) {
                console.error("Clipboard error:", e);
                showNotification(t('clipboardFail'), 'error');
                return false;
            }
        });
        return true;
    }
    function insertCharacterPrompts(characters, warningContainer = null) {
        if (!characters || characters.length === 0) return;
        const containers = [
            '.character-prompt-input-1 .ProseMirror',
            '.character-prompt-input-2 .ProseMirror',
            '.character-prompt-input-3 .ProseMirror',
            '.character-prompt-input-4 .ProseMirror',
            '.character-prompt-input-5 .ProseMirror',
            '.character-prompt-input-6 .ProseMirror',
            '.character-prompt-input-7 .ProseMirror',
            '.character-prompt-input-8 .ProseMirror',
            '.character-prompt-input-9 .ProseMirror',
            '.character-prompt-input-10 .ProseMirror'
        ].map(sel => document.querySelector(sel)).filter(Boolean);
        if (containers.length === 0) return;
        if (warningContainer) {
            if (characters.length > containers.length) {
                warningContainer.textContent = t('maxCharsWarning', characters.length, containers.length);
                warningContainer.style.display = 'block';
            } else {
                warningContainer.style.display = 'none';
            }
        }
let hasVarsOrWC = false;
for (const char of characters) {
    if (!char.prompt) continue;

    const variables = extractVariables(char.prompt);
    const undefVars = variables.filter(v => globalVariables[v] === undefined);

    const extractedWC = extractWildcards(char.prompt);
    const availableWC = extractedWC.filter(key => {
        const options = wildcards[key];
        return Array.isArray(options) && options.length > 0;
    });

    if (undefVars.length > 0 || availableWC.length > 0) {
        hasVarsOrWC = true;
        break;
    }
}
        if (hasVarsOrWC) {
            const colors = getThemeColors();
            const modal = document.createElement('div');
            modal.id = 'nai-char-vars-modal';
            Object.assign(modal.style, {
                position: 'fixed', top: '50%', left: '50%',
                transform: 'translate(-50%, -50%)', width: isMobile ? '90%' : '500px', maxWidth: '90vw',
                background: colors.background, color: colors.color,
                border: `1px solid ${colors.borderColor}`, borderRadius: '12px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.2)', zIndex: '20000',
                padding: '20px', fontFamily: 'sans-serif', boxSizing: 'border-box',
                display: 'flex', flexDirection: 'column', maxHeight: isMobile ? '85vh' : '80vh'
            });
            const contentArea = document.createElement('div');
            contentArea.style.flex = '1';
            contentArea.style.overflowY = 'auto';
            contentArea.style.marginBottom = '16px';

            contentArea.innerHTML = `
                <div style="font-weight:bold; font-size:16px; margin-bottom:16px;">${t('fillCharVarsTitle')}</div>
                <div style="font-size:13px; margin-bottom:16px; opacity:0.9;">${t('fillCharVarsDesc')}</div>
                <div style="margin-bottom:20px;">
                    <div style="margin-bottom:12px;">
                        <label style="display:block; font-size:13px; margin-bottom:4px; opacity:0.9;">Select character to configure:</label>
                        <select id="char-select"
                                style="width:100%; padding:8px; border-radius:6px; border:1px solid ${colors.borderColor};
                                       background:${colors.inputBackground}; color:${colors.inputColor}; font-size:13px;">
                            ${characters.map((char, idx) => `<option value="${idx}">${char.name || `Character ${idx+1}`}</option>`).join('')}
                        </select>
                    </div>
                    <div id="char-vars-container"></div>
                </div>
            `;
            const buttonArea = document.createElement('div');
            buttonArea.style.display = 'flex';
            buttonArea.style.gap = '8px';
            buttonArea.style.justifyContent = 'flex-end';
            buttonArea.style.paddingTop = '16px';
            buttonArea.style.borderTop = `1px solid ${colors.borderColor}`;

            const cancelBtn = document.createElement('button');
            cancelBtn.id = 'cancel-char-vars';
            cancelBtn.textContent = t('cancel');
            Object.assign(cancelBtn.style, {
                padding: '6px 12px', background: colors.deleteBackground, color: 'white', border: 'none',
                borderRadius: '6px', cursor: 'pointer'
            });

            const applyBtn = document.createElement('button');
            applyBtn.id = 'apply-char-vars';
            applyBtn.textContent = t('apply');
            Object.assign(applyBtn.style, {
                padding: '6px 12px', background: colors.buttonBackground, color: 'white', border: 'none',
                borderRadius: '6px', cursor: 'pointer'
            });

            buttonArea.appendChild(cancelBtn);
            buttonArea.appendChild(applyBtn);
            modal.appendChild(contentArea);
            modal.appendChild(buttonArea);

            document.body.appendChild(modal);

            const charSelect = modal.querySelector('#char-select');
            const varsContainer = modal.querySelector('#char-vars-container');
            const cancelBtnClick = () => document.body.removeChild(modal);
            const applyBtnClick = () => {
                const processedPrompts = [];
                characters.forEach((char, idx) => {
                    if (!char.prompt) {
                        processedPrompts[idx] = '';
                        return;
                    }
                    let processedPrompt = char.prompt;
                    const variables = extractVariables(char.prompt);
                    const undefVars = variables.filter(v => globalVariables[v] === undefined);
                    undefVars.forEach(variable => {
                        const input = modal.querySelector(`#char-var-${variable}`);
                        if (input) {
                            const value = input.value.trim();
                            if (value) {
                                const escapedKey = variable.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                                const pattern = new RegExp(`{${escapedKey}}`, 'g');
                                processedPrompt = processedPrompt.replace(pattern, value);
                            }
                        }
                    });
                    const wildcardsList = extractWildcards(char.prompt);
                    wildcardsList.forEach(wildcard => {
                        const select = modal.querySelector(`#char-wildcard-${wildcard}`);
                        if (select) {
                            const value = select.value;
                            if (value === "__random__") {
                                const options = wildcards[wildcard] || [];
                                if (options.length > 0) {
                                    let remaining = wildcardRemaining[wildcard] || [...options];
                                    if (remaining.length === 0) remaining = [...options];
                                    const chosen = remaining.shift();
                                    wildcardRemaining[wildcard] = remaining;
                                    const escapedKey = wildcard.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                                    const pattern = new RegExp(`\\[${escapedKey}\\]`, 'g');
                                    processedPrompt = processedPrompt.replace(pattern, chosen);
                                }
                            } else if (value) {
                                const escapedKey = wildcard.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                                const pattern = new RegExp(`\\[${escapedKey}\\]`, 'g');
                                processedPrompt = processedPrompt.replace(pattern, value);
                            }
                        }
                    });
                    processedPrompt = replaceGlobalVariables(processedPrompt);
                    processedPrompts[idx] = processedPrompt;
                });
                localStorage.setItem(WILDCARD_REMAINING_KEY, JSON.stringify(wildcardRemaining));
                document.body.removeChild(modal);
                applyProcessedCharacterPromptsWithValues(characters, processedPrompts, warningContainer);
            };

            cancelBtn.onclick = cancelBtnClick;
            cancelBtn.addEventListener('touchend', (e) => { e.preventDefault(); cancelBtnClick(); }, { passive: false });
            applyBtn.onclick = applyBtnClick;
            applyBtn.addEventListener('touchend', (e) => { e.preventDefault(); applyBtnClick(); }, { passive: false });

            function updateCharVars() {
                const idx = parseInt(charSelect.value);
                const char = characters[idx];
                if (!char || !char.prompt) {
                    varsContainer.innerHTML = '<p style="opacity:0.7">No prompt</p>';
                    return;
                }
                const variables = extractVariables(char.prompt);
                const wildcardsList = extractWildcards(char.prompt);
                let html = '';
                const undefVars = variables.filter(v => globalVariables[v] === undefined);
                if (undefVars.length > 0) {
                    html += '<div style="margin-bottom:16px;"><h4 style="margin:0 0 8px 0; font-size:14px;">Variables</h4>';
                    undefVars.forEach(variable => {
                        const currentValue = globalVariables[variable] || '';
                        html += `
                            <div style="margin-bottom:12px;">
                                <label style="display:block; font-size:13px; margin-bottom:4px; opacity:0.9;">{${variable}}:</label>
                                <input type="text" id="char-var-${variable}"
                                       value="${currentValue}"
                                       placeholder="Enter value for ${variable}"
                                       style="width:100%; padding:8px; border-radius:6px; border:1px solid ${colors.borderColor};
                                              background:${colors.inputBackground}; color:${colors.inputColor}; font-size:13px;" />
                            </div>
                        `;
                    });
                    html += '</div>';
                }
                if (wildcardsList.length > 0) {
                    html += '<div style="margin-bottom:16px;"><h4 style="margin:0 0 8px 0; font-size:14px;">Wildcards</h4>';
                    wildcardsList.forEach(wildcard => {
                        const options = wildcards[wildcard] || [];
                        let optionsHtml = '<option value="__random__">🎲 Random</option>';
                        options.forEach(opt => {
                            optionsHtml += `<option value="${opt}">${opt}</option>`;
                        });
                        html += `
                            <div style="margin-bottom:12px;">
                                <label style="display:block; font-size:13px; margin-bottom:4px; opacity:0.9;">[${wildcard}]:</label>
                                <select id="char-wildcard-${wildcard}"
                                        style="width:100%; padding:8px; border-radius:6px; border:1px solid ${colors.borderColor};
                                               background:${colors.inputBackground}; color:${colors.inputColor}; font-size:13px;">
                                    ${optionsHtml}
                                </select>
                            </div>
                        `;
                    });
                    html += '</div>';
                }
                varsContainer.innerHTML = html || '<p style="opacity:0.7">No variables or wildcards</p>';
            }
            updateCharVars();
            charSelect.addEventListener('change', updateCharVars);
            modal.addEventListener('click', e => { if (e.target === modal) document.body.removeChild(modal); });
        } else {
            applyProcessedCharacterPrompts(characters, warningContainer);
        }
    }
    function applyProcessedCharacterPromptsWithValues(originalChars, processedPrompts, warningContainer = null) {
        const containers = [
            '.character-prompt-input-1 .ProseMirror',
            '.character-prompt-input-2 .ProseMirror',
            '.character-prompt-input-3 .ProseMirror',
            '.character-prompt-input-4 .ProseMirror',
            '.character-prompt-input-5 .ProseMirror',
            '.character-prompt-input-6 .ProseMirror',
            '.character-prompt-input-7 .ProseMirror',
            '.character-prompt-input-8 .ProseMirror',
            '.character-prompt-input-9 .ProseMirror',
            '.character-prompt-input-10 .ProseMirror'
        ].map(sel => document.querySelector(sel)).filter(Boolean);
        setTimeout(() => {
            containers.forEach((container, index) => {
                const prompt = processedPrompts[index] || '';
                if (container) {
                    const view = findPMView(container);
                    if (view) {
                        const tr = view.state.tr;
                        tr.delete(0, view.state.doc.content.size);
                        tr.insertText(prompt);
                        view.dispatch(tr);
                    } else {
                        container.textContent = prompt;
                        container.dispatchEvent(new Event('input', { bubbles: true }));
                        container.dispatchEvent(new Event('change', { bubbles: true }));
                    }
                }
            });
        }, 50);
    }
    function applyProcessedCharacterPrompts(characters, warningContainer = null) {
        const containers = [
            '.character-prompt-input-1 .ProseMirror',
            '.character-prompt-input-2 .ProseMirror',
            '.character-prompt-input-3 .ProseMirror',
            '.character-prompt-input-4 .ProseMirror',
            '.character-prompt-input-5 .ProseMirror',
            '.character-prompt-input-6 .ProseMirror',
            '.character-prompt-input-7 .ProseMirror',
            '.character-prompt-input-8 .ProseMirror',
            '.character-prompt-input-9 .ProseMirror',
            '.character-prompt-input-10 .ProseMirror'
        ].map(sel => document.querySelector(sel)).filter(Boolean);
        setTimeout(() => {
            containers.forEach((container, index) => {
                const char = characters[index];
                if (char && container) {
                    const prompt = char.prompt || '';
                    const view = findPMView(container);
                    if (view) {
                        const tr = view.state.tr;
                        tr.delete(0, view.state.doc.content.size);
                        tr.insertText(prompt);
                        view.dispatch(tr);
                    } else {
                        container.textContent = prompt;
                        container.dispatchEvent(new Event('input', { bubbles: true }));
                        container.dispatchEvent(new Event('change', { bubbles: true }));
                    }
                } else if (container) {
                    const view = findPMView(container);
                    if (view) {
                        const tr = view.state.tr;
                        tr.delete(0, view.state.doc.content.size);
                        view.dispatch(tr);
                    } else {
                        container.textContent = '';
                        container.dispatchEvent(new Event('input', { bubbles: true }));
                        container.dispatchEvent(new Event('change', { bubbles: true }));
                    }
                }
            });
        }, 50);
    }
    function createPanelOnce() {
        if (document.getElementById('nai-profiles-panel')) return;
        const container = document.querySelector('.image-gen-prompt-main') || document.querySelector('.prompt-input-box-prompt');
        if (!container) {
            setTimeout(createPanelOnce, 500);
            return;
        }
    const globalStyle = document.createElement('style');
    globalStyle.id = 'nai-hidden-scrollbar-style';
    globalStyle.textContent = `
        #nai-profiles-panel .char-list-container ::-webkit-scrollbar,
        .nai-hidden-scrollbar ::-webkit-scrollbar {
            width: 0 !important;
            height: 0 !important;
            display: none !important;
        }
        #nai-profiles-panel .char-list-container {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
    `;
    if (!document.getElementById('nai-hidden-scrollbar-style')) {
        document.head.appendChild(globalStyle);
    }
        let panel, select, taPositive, taNegative, status, charsList, charWarning, toggle, searchDiv, searchInput, charDBSelect, charDBSearchInput;
        let savedPos = { x: 10, y: 10 };
        try {
            const posStr = localStorage.getItem(ICON_POS_KEY);
            if (posStr) savedPos = JSON.parse(posStr);
        } catch (e) {}
        toggle = document.createElement('div');
        toggle.id = "nai-profiles-toggle";
        Object.assign(toggle.style, {
            position: "fixed", top: "0", left: "0", zIndex: "10000", cursor: "move",
            fontSize: isMobile ? "24px" : "20px", padding: isMobile ? "12px" : "8px", backgroundColor: "#f8fafc", color: "#1e40af",
            border: "1px solid #bfdbfe", borderRadius: "8px", boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
            userSelect: "none", transform: `translate(${savedPos.x}px, ${savedPos.y}px)`,
            transition: "opacity 0.2s ease", display: "flex", alignItems: "center", justifyContent: "center",
            width: isMobile ? "48px" : "36px", height: isMobile ? "48px" : "36px"
        });
        toggle.title = "Drag to move | Click to open";
        toggle.innerHTML = "📝";
        document.body.appendChild(toggle);
        let isDragging = false;
        let offsetX = 0, offsetY = 0;
        function handleStart(e) {
            if (e.target.tagName === 'BUTTON') return;
            isDragging = true;

            if (e.type === 'touchstart') {
                offsetX = e.touches[0].clientX - savedPos.x;
                offsetY = e.touches[0].clientY - savedPos.y;
            } else {
                offsetX = e.clientX - savedPos.x;
                offsetY = e.clientY - savedPos.y;
            }

            toggle.style.opacity = "0.85";
            toggle.style.cursor = "grabbing";
            e.preventDefault();
        }

        function handleMove(e) {
            if (!isDragging) return;

            let clientX, clientY;
            if (e.type === 'touchmove') {
                clientX = e.touches[0].clientX;
                clientY = e.touches[0].clientY;
            } else {
                clientX = e.clientX;
                clientY = e.clientY;
            }

            let x = Math.max(10, Math.min(clientX - offsetX, window.innerWidth - (isMobile ? 48 : 36)));
            let y = Math.max(10, Math.min(clientY - offsetY, window.innerHeight - (isMobile ? 48 : 36)));
            toggle.style.transform = `translate(${x}px, ${y}px)`;
        }

        function handleEnd() {
            if (isDragging) {
                isDragging = false;
                toggle.style.opacity = "1";
                toggle.style.cursor = "move";
                const match = toggle.style.transform.match(/translate\(([^,]+)px,\s*([^)]+)px\)/);
                if (match) {
                    savedPos = { x: parseFloat(match[1]), y: parseFloat(match[2]) };
                    localStorage.setItem(ICON_POS_KEY, JSON.stringify(savedPos));
                    if (panel && panel.style.display !== "none") updatePanelPosition();
                }
            }
        }
        toggle.addEventListener("mousedown", handleStart);
        document.addEventListener("mousemove", handleMove);
        document.addEventListener("mouseup", handleEnd);
        toggle.addEventListener("touchstart", handleStart, { passive: false });
        toggle.addEventListener("touchmove", handleMove, { passive: false });
        toggle.addEventListener("touchend", handleEnd);
        function handleToggleClick(e) {
            e.preventDefault();
            e.stopPropagation();

            if (panel) {
                panel.style.display = panel.style.display === "none" ? "block" : "none";
                if (panel.style.display === "block") updatePanelPosition();
                return;
            }

            createPanel();
        }

        toggle.addEventListener("click", handleToggleClick);
        toggle.addEventListener("touchend", handleToggleClick);
        function updateCharDBUI(searchTerm = '') {
            const dbKeys = Object.keys(characterDatabase);
            const filteredKeys = dbKeys.filter(key =>
                key.toLowerCase().includes(searchTerm.toLowerCase())
            );

            charDBSelect.innerHTML = '';
            const defaultOption = document.createElement('option');
            defaultOption.value = '';
            defaultOption.textContent = t('selectChar');
            defaultOption.disabled = true;
            charDBSelect.appendChild(defaultOption);

            if (filteredKeys.length === 0) {
                const noOption = document.createElement('option');
                noOption.value = '';
                noOption.textContent = searchTerm ? t('noCharsFound') : t('noCharacters');
                noOption.disabled = true;
                charDBSelect.appendChild(noOption);
                return;
            }

            filteredKeys.forEach(name => {
                const option = document.createElement('option');
                option.value = name;
                option.textContent = name;
                charDBSelect.appendChild(option);
            });
        }

        function openCharacterDBModal(editName = null, editPrompt = null, callback = null) {
            if (document.getElementById('nai-character-db-modal')) return;
            const isEdit = editName !== null;
            const colors = getThemeColors();
            const modal = document.createElement('div');
            modal.id = 'nai-character-db-modal';
            Object.assign(modal.style, {
                position: 'fixed', top: '50%', left: '50%',
                transform: 'translate(-50%, -50%)', width: isMobile ? '90%' : '400px', maxWidth: '90vw',
                background: colors.background, color: colors.color,
                border: `1px solid ${colors.borderColor}`, borderRadius: '12px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.2)', zIndex: '20000',
                padding: '20px', fontFamily: 'sans-serif', boxSizing: 'border-box'
            });
            modal.innerHTML = `
                <div style="font-weight:bold; font-size:16px; margin-bottom:16px;">${isEdit ? 'Edit Character' : 'Add Character to Database'}</div>
                <div style="margin-bottom:12px;"><label style="display:block; font-size:13px; margin-bottom:4px; opacity:0.9;">Character Name:</label><input type="text" id="char-db-name" placeholder="e.g. Hatsune Miku" value="${isEdit ? editName : ''}" style="width:100%; padding:8px; border-radius:6px; border:1px solid ${colors.borderColor}; background:${colors.inputBackground}; color:${colors.inputColor}; font-size:13px;" /></div>
                <div style="margin-bottom:16px;"><label style="display:block; font-size:13px; margin-bottom:4px; opacity:0.9;">Character Prompt:</label><textarea id="char-db-prompt" rows="4" placeholder="e.g. girl, blue hair, twintail, aqua eyes..." style="width:100%; padding:8px; border-radius:6px; border:1px solid ${colors.borderColor}; background:${colors.inputBackground}; color:${colors.inputColor}; font-size:13px; resize:vertical;">${isEdit ? editPrompt : ''}</textarea></div>
                <div style="display:flex; gap:8px; justify-content:flex-end;"><button id="cancel-char-db" style="padding:6px 12px; background:${colors.deleteBackground}; color:white; border:none; border-radius:6px; cursor:pointer;">Cancel</button><button id="save-char-db" style="padding:6px 12px; background:${colors.buttonBackground}; color:white; border:none; border-radius:6px; cursor:pointer;">${isEdit ? 'Update' : 'Save'}</button></div>
            `;
            document.body.appendChild(modal);
            const nameInput = modal.querySelector('#char-db-name');
            const promptInput = modal.querySelector('#char-db-prompt');
            const saveBtn = modal.querySelector('#save-char-db');
            const cancelBtn = modal.querySelector('#cancel-char-db');
            saveBtn.onclick = () => {
                const name = nameInput.value.trim();
                const prompt = promptInput.value.trim();
                if (!name || !prompt) { showNotification('Name and prompt are required.', 'error'); return; }
                if (isEdit && name !== editName) {
                    delete characterDatabase[editName];
                }

                characterDatabase[name] = prompt;
                localStorage.setItem(CHARACTER_DB_KEY, JSON.stringify(characterDatabase));
                updateCharDBUI(charDBSearchInput.value);
                document.body.removeChild(modal);
                showNotification(`✅ Character "${name}" ${isEdit ? 'updated' : 'added'} to database`, 'success');
                if (callback) callback();
            };
            cancelBtn.onclick = () => {
                document.body.removeChild(modal);
                if (callback) callback();
            };
            modal.addEventListener('click', e => { if (e.target === modal) {
                document.body.removeChild(modal);
                if (callback) callback();
            }});
        }
        function openOrganizeCharDBModal() {
            if (document.getElementById('nai-organize-char-db-modal')) return;

            const colors = getThemeColors();
            const modal = document.createElement('div');
            modal.id = 'nai-organize-char-db-modal';
            Object.assign(modal.style, {
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: isMobile ? '90%' : '500px',
                maxWidth: '90vw',
                height: isMobile ? '70vh' : '60vh',
                background: colors.background,
                color: colors.color,
                border: `1px solid ${colors.borderColor}`,
                borderRadius: '12px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                zIndex: '20000',
                padding: '20px',
                fontFamily: 'sans-serif',
                boxSizing: 'border-box',
                display: 'flex',
                flexDirection: 'column'
            });
            const header = document.createElement('div');
            header.style.display = 'flex';
            header.style.justifyContent = 'space-between';
            header.style.alignItems = 'center';
            header.style.marginBottom = '16px';

            const title = document.createElement('h3');
            title.textContent = t('organizeCharDBTitle');
            title.style.margin = '0';
            title.style.fontSize = '16px';

            const closeBtn = document.createElement('button');
            closeBtn.innerHTML = '✕';
            Object.assign(closeBtn.style, {
                background: 'none',
                border: 'none',
                fontSize: '18px',
                cursor: 'pointer',
                padding: '4px',
                borderRadius: '4px',
                color: colors.color
            });
            closeBtn.onmouseover = () => { closeBtn.style.backgroundColor = colors.inputBackground; };
            closeBtn.onmouseout = () => { closeBtn.style.backgroundColor = 'transparent'; };
            closeBtn.onclick = () => document.body.removeChild(modal);

            header.appendChild(title);
            header.appendChild(closeBtn);
            const searchContainer = document.createElement('div');
            searchContainer.style.marginBottom = '12px';

            const searchInput = document.createElement('input');
            searchInput.type = 'text';
            searchInput.placeholder = t('searchCharsPlaceholder');
            Object.assign(searchInput.style, {
                width: '100%',
                padding: '8px',
                borderRadius: '6px',
                border: `1px solid ${colors.borderColor}`,
                background: colors.inputBackground,
                color: colors.inputColor,
                fontSize: '13px'
            });

            searchContainer.appendChild(searchInput);
            const listContainer = document.createElement('div');
            listContainer.style.flex = '1';
            listContainer.style.overflowY = 'auto';
            listContainer.style.border = `1px solid ${colors.borderColor}`;
            listContainer.style.borderRadius = '6px';
            listContainer.style.padding = '8px';
            function updateCharacterList(searchTerm = '') {
                listContainer.innerHTML = '';

                const dbKeys = Object.keys(characterDatabase);
                const filteredKeys = dbKeys.filter(key =>
                    key.toLowerCase().includes(searchTerm.toLowerCase())
                );

                if (filteredKeys.length === 0) {
                    const noCharsMsg = document.createElement('div');
                    noCharsMsg.textContent = searchTerm ? t('noCharsFound') : t('noCharacters');
                    noCharsMsg.style.textAlign = 'center';
                    noCharsMsg.style.padding = '20px';
                    noCharsMsg.style.opacity = '0.7';
                    listContainer.appendChild(noCharsMsg);
                    return;
                }

                filteredKeys.forEach(name => {
                    const item = document.createElement('div');
                    item.style.display = 'flex';
                    item.style.alignItems = 'center';
                    item.style.justifyContent = 'space-between';
                    item.style.padding = '8px';
                    item.style.borderRadius = '4px';
                    item.style.marginBottom = '6px';
                    item.style.backgroundColor = colors.inputBackground;

                    const nameSpan = document.createElement('span');
                    nameSpan.textContent = name;
                    nameSpan.style.flex = '1';
                    nameSpan.style.marginRight = '8px';
                    nameSpan.style.overflow = 'hidden';
                    nameSpan.style.textOverflow = 'ellipsis';
                    nameSpan.style.whiteSpace = 'nowrap';

                    const actionsContainer = document.createElement('div');
                    actionsContainer.style.display = 'flex';
                    actionsContainer.style.gap = '4px';
                    const editBtn = document.createElement('button');
                    editBtn.innerHTML = '✏️';
                    Object.assign(editBtn.style, {
                        padding: '4px 6px',
                        borderRadius: '4px',
                        border: 'none',
                        background: colors.buttonBackground,
                        color: 'white',
                        cursor: 'pointer',
                        fontSize: '12px'
                    });
                    editBtn.onclick = () => {
                        openCharacterDBModal(name, characterDatabase[name], () => {
                            updateCharacterList(searchInput.value);
                            updateCharDBUI(charDBSearchInput.value);
                        });
                    };
                    const renameBtn = document.createElement('button');
                    renameBtn.innerHTML = '📝';
                    Object.assign(renameBtn.style, {
                        padding: '4px 6px',
                        borderRadius: '4px',
                        border: 'none',
                        background: '#64748b',
                        color: 'white',
                        cursor: 'pointer',
                        fontSize: '12px'
                    });
                    renameBtn.onclick = () => {
                        const newName = prompt('Enter new name:', name);
                        if (!newName || newName === name) return;
                        if (characterDatabase[newName]) {
                            showNotification(`Character "${newName}" already exists`, 'error');
                            return;
                        }
                        characterDatabase[newName] = characterDatabase[name];
                        delete characterDatabase[name];
                        localStorage.setItem(CHARACTER_DB_KEY, JSON.stringify(characterDatabase));
                        updateCharacterList(searchInput.value);
                        updateCharDBUI(charDBSearchInput.value);
                        showNotification(t('charRenamed', name, newName), 'success');
                    };
                    const deleteBtn = document.createElement('button');
                    deleteBtn.innerHTML = '🗑️';
                    Object.assign(deleteBtn.style, {
                        padding: '4px 6px',
                        borderRadius: '4px',
                        border: 'none',
                        background: colors.deleteBackground,
                        color: 'white',
                        cursor: 'pointer',
                        fontSize: '12px'
                    });
                    deleteBtn.onclick = () => {
                        if (confirm(t('confirmDeleteChar', name))) {
                            delete characterDatabase[name];
                            localStorage.setItem(CHARACTER_DB_KEY, JSON.stringify(characterDatabase));
                            updateCharacterList(searchInput.value);
                            updateCharDBUI(charDBSearchInput.value);
                            showNotification(t('charDeleted', name), 'info');
                        }
                    };

                    actionsContainer.appendChild(editBtn);
                    actionsContainer.appendChild(renameBtn);
                    actionsContainer.appendChild(deleteBtn);

                    item.appendChild(nameSpan);
                    item.appendChild(actionsContainer);
                    listContainer.appendChild(item);
                });
            }
            updateCharacterList();
            searchInput.addEventListener('input', () => {
                updateCharacterList(searchInput.value);
            });
            modal.appendChild(header);
            modal.appendChild(searchContainer);
            modal.appendChild(listContainer);
            if (isMobile) {
                const bottomCloseBtn = document.createElement('button');
                bottomCloseBtn.textContent = t('close');
                Object.assign(bottomCloseBtn.style, {
                    padding: '12px',
                    borderRadius: '6px',
                    border: 'none',
                    background: colors.deleteBackground,
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '14px',
                    marginTop: '12px',
                    width: '100%'
                });
                bottomCloseBtn.onclick = () => document.body.removeChild(modal);
                modal.appendChild(bottomCloseBtn);
            }

            document.body.appendChild(modal);
            modal.addEventListener('click', e => {
                if (e.target === modal) document.body.removeChild(modal);
            });
        }

        function createPanel() {
            const colors = getThemeColors();
            panel = document.createElement("div");
            panel.id = "nai-profiles-panel";
            panel.className = isMobile ? "nai-responsive-panel" : "";
            Object.assign(panel.style, {
                position: "fixed",
                width: isMobile ? "95%" : "380px",
                maxWidth: isMobile ? "95%" : "380px",
                height: isMobile ? "80vh" : "auto",
                maxHeight: isMobile ? "80vh" : "none",
                overflowY: "auto",
                background: colors.background, color: colors.color, border: `1px solid ${colors.borderColor}`,
                borderRadius: "12px", boxShadow: "0 10px 30px rgba(0,0,0,0.2)", zIndex: "10000",
                padding: isMobile ? "16px" : "12px", fontFamily: "sans-serif", boxSizing: "border-box",
                fontSize: isMobile ? "14px" : "13px", display: "none"
            });
if (!document.getElementById('nai-hidden-scrollbar-style')) {
    const style = document.createElement('style');
    style.id = 'nai-hidden-scrollbar-style';
    style.textContent = `
        #nai-profiles-panel .char-list-container {
            -ms-overflow-style: none; /* IE/Edge */
            scrollbar-width: none;   /* Firefox */
        }
        #nai-profiles-panel .char-list-container::-webkit-scrollbar {
            width: 0 !important;
            height: 0 !important;
            display: none !important;
        }
    `;
    document.head.appendChild(style);
}
            document.body.appendChild(panel);
            const header = document.createElement("div");
            header.style.display = "flex"; header.style.justifyContent = "space-between";
            header.style.alignItems = "center"; header.style.marginBottom = "10px";
            const title = document.createElement("h3");
            title.style.margin = "0"; title.style.fontSize = isMobile ? "16px" : "14px"; title.style.fontWeight = "bold";
            title.textContent = t('profilesTitle');
            const minimizeBtn = document.createElement("button");
            minimizeBtn.innerHTML = "−";
            Object.assign(minimizeBtn.style, {
                background: "none", border: "none", fontSize: isMobile ? "20px" : "18px", cursor: "pointer",
                padding: "4px", borderRadius: "4px", color: colors.color,
                width: isMobile ? "32px" : "24px", height: isMobile ? "32px" : "24px",
                display: "flex", alignItems: "center", justifyContent: "center"
            });
            minimizeBtn.onmouseover = () => { minimizeBtn.style.backgroundColor = colors.inputBackground; };
            minimizeBtn.onmouseout = () => { minimizeBtn.style.backgroundColor = "transparent"; };

            const closeBtn = document.createElement("button");
            closeBtn.innerHTML = "✕";
            Object.assign(closeBtn.style, {
                background: "none", border: "none", fontSize: isMobile ? "20px" : "18px", cursor: "pointer",
                padding: "4px", borderRadius: "4px", color: colors.color,
                width: isMobile ? "32px" : "24px", height: isMobile ? "32px" : "24px",
                display: "flex", alignItems: "center", justifyContent: "center",
                zIndex: 10001
            });
            closeBtn.onmouseover = () => { closeBtn.style.backgroundColor = colors.inputBackground; };
            closeBtn.onmouseout = () => { closeBtn.style.backgroundColor = "transparent"; };
            const handleClose = (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (panel) {
                    panel.style.display = "none";
                }
            };
            closeBtn.onclick = handleClose;
            closeBtn.addEventListener('touchend', handleClose, { passive: false });

            header.appendChild(title); header.appendChild(minimizeBtn); header.appendChild(closeBtn);
            panel.appendChild(header);
            const panelContent = document.createElement("div");
            panelContent.id = "panel-content";
            const tabContainer = document.createElement("div");
            tabContainer.style.marginBottom = "8px";

            const tabButtons = document.createElement("div");
            tabButtons.style.display = "flex";
            tabButtons.style.marginBottom = "8px";
            tabButtons.style.flexWrap = isMobile ? "wrap" : "nowrap";

            const tabContent = document.createElement("div");
            tabContent.style.padding = "8px";
            tabContent.style.border = `1px solid ${colors.borderColor}`;
            tabContent.style.borderRadius = "6px";
            const tabs = [
                { id: "profile", name: t('profileTab'), active: true },
                { id: "character", name: t('characterTab'), active: false },
                { id: "utility", name: t('utilityTab'), active: false },
                { id: "settings", name: t('settingsTab'), active: false }
            ];

            tabs.forEach(tab => {
                const tabBtn = document.createElement("button");
                tabBtn.textContent = tab.name;
                tabBtn.className = "nai-responsive-text";
                Object.assign(tabBtn.style, {
                    padding: isMobile ? "8px 12px" : "6px 12px",
                    borderRadius: "6px 6px 0 0",
                    border: "none",
                    background: tab.active ? colors.buttonBackground : colors.inputBackground,
                    color: "white",
                    cursor: "pointer",
                    fontSize: isMobile ? "12px" : "12px",
                    marginRight: "2px",
                    marginBottom: isMobile ? "4px" : "0",
                    flex: isMobile ? "1" : "none",
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                });

                tabBtn.onclick = () => {
                    document.querySelectorAll(".tab-content").forEach(content => {
                        content.style.display = "none";
                    });
                    document.getElementById(`tab-${tab.id}`).style.display = "block";
                    tabs.forEach(t => {
                        const isActive = t.id === tab.id;
                        const btn = Array.from(tabButtons.children).find(b => b.textContent === t.name);
                        if (btn) {
                            btn.style.background = isActive ? colors.buttonBackground : colors.inputBackground;
                        }
                    });
                };

                tabButtons.appendChild(tabBtn);
            });

            tabContainer.appendChild(tabButtons);
            tabContainer.appendChild(tabContent);
            panelContent.appendChild(tabContainer);
            const profileTab = document.createElement("div");
            profileTab.id = "tab-profile";
            profileTab.className = "tab-content";
            searchDiv = document.createElement("div");
            searchDiv.style.marginBottom = "8px";
            searchDiv.style.display = "none";
            searchInput = document.createElement("input");
            searchInput.type = "text";
            searchInput.placeholder = t('searchProfiles');
            Object.assign(searchInput.style, {
                width: "100%", padding: isMobile ? "10px" : "6px", borderRadius: "6px", border: `1px solid ${colors.borderColor}`,
                background: colors.inputBackground, color: colors.inputColor, fontSize: isMobile ? "14px" : "13px"
            });
            searchDiv.appendChild(searchInput);
            profileTab.appendChild(searchDiv);

            const selectDiv = document.createElement("div");
            selectDiv.style.marginBottom = "8px";
            select = document.createElement("select");
            Object.assign(select.style, {
                width: "100%", padding: isMobile ? "10px" : "6px", borderRadius: "6px", border: `1px solid ${colors.borderColor}`,
                background: colors.inputBackground, color: colors.inputColor, fontSize: isMobile ? "14px" : "13px"
            });
            selectDiv.appendChild(select);
            profileTab.appendChild(selectDiv);

            // MOBILE FIX: Create a container for Override and Append buttons
            const mobileActionButtons = document.createElement("div");
            if (isMobile) {
                mobileActionButtons.className = "mobile-action-buttons";
            } else {
                mobileActionButtons.style.display = "flex";
                mobileActionButtons.style.gap = "6px";
                mobileActionButtons.style.marginBottom = "8px";
            }

            const overrideBtn = document.createElement("button");
            overrideBtn.textContent = t('override');
            overrideBtn.className = "nai-responsive-button";
            Object.assign(overrideBtn.style, {
                flex: "1",
                padding: isMobile ? "12px" : "6px",
                borderRadius: "6px",
                border: "none",
                background: colors.buttonBackground,
                color: "white",
                cursor: "pointer",
                fontSize: isMobile ? "14px" : "12px",
                fontWeight: "bold",
                minHeight: isMobile ? "44px" : "auto"
            });
            overrideBtn.onclick = () => {
                const positiveText = taPositive.value.trim();
                const negativeText = taNegative.value.trim();

                if (positiveText) {
                    applyTextToEditor(positiveText, status);
                }
                if (negativeText) {
                    applyTextToNegativeEditor(negativeText, status);
                }

                const name = select.value;
                if (name) {
                    const profile = profiles.find(p => p.name === name);
                    if (profile && profile.characters && profile.characters.length > 0) {
                        insertCharacterPrompts(profile.characters, charWarning);
                    }
                }

                showNotification(`✅ Applied current editor content`, 'success');
            };

            const appendBtn = document.createElement("button");
            appendBtn.textContent = t('append');
            appendBtn.className = "nai-responsive-button";
            Object.assign(appendBtn.style, {
                flex: "1",
                padding: isMobile ? "12px" : "6px",
                borderRadius: "6px",
                border: "none",
                background: colors.buttonBackground,
                color: "white",
                cursor: "pointer",
                fontSize: isMobile ? "14px" : "12px",
                fontWeight: "bold",
                minHeight: isMobile ? "44px" : "auto"
            });
            appendBtn.onclick = () => {
                const positiveText = taPositive.value.trim();
                const negativeText = taNegative.value.trim();

                if (positiveText) {
                    applyTextToEditorAppend(positiveText, status);
                }
                if (negativeText) {
                    applyTextToNegativeEditor(negativeText, status);
                }

                showNotification(`✅ Appended current editor content`, 'success');
            };

            // Add buttons to the container
            mobileActionButtons.appendChild(overrideBtn);
            mobileActionButtons.appendChild(appendBtn);
            profileTab.appendChild(mobileActionButtons);

            const profileMenuRow = document.createElement("div");
            profileMenuRow.style.display = "flex";
            profileMenuRow.style.gap = "6px";
            profileMenuRow.style.marginBottom = "8px";
            profileMenuRow.style.position = "relative";

            const profileMenuBtn = document.createElement("button");
            profileMenuBtn.textContent = "📁 Profile";
            profileMenuBtn.className = "nai-responsive-button";
            Object.assign(profileMenuBtn.style, {
                width: "100%",
                padding: isMobile ? "12px" : "6px",
                borderRadius: "6px",
                border: "none",
                background: colors.buttonBackground,
                color: "white",
                cursor: "pointer",
                fontSize: isMobile ? "14px" : "12px",
                minHeight: isMobile ? "44px" : "auto"
            });
            const profileDropdown = document.createElement("div");
            profileDropdown.style.display = "none";
            profileDropdown.style.backgroundColor = colors.inputBackground;
            profileDropdown.style.border = `1px solid ${colors.borderColor}`;
            profileDropdown.style.borderRadius = "6px";
            profileDropdown.style.zIndex = "1000";
            profileDropdown.style.minWidth = "150px";
            profileDropdown.style.top = "100%";
            profileDropdown.style.left = "0";
            profileDropdown.style.marginTop = "2px";
            if (isMobile) {
                profileDropdown.style.position = "fixed";
                profileDropdown.style.top = "50%";
                profileDropdown.style.left = "50%";
                profileDropdown.style.transform = "translate(-50%, -50%)";
                profileDropdown.style.width = isMobile && window.innerWidth <= 400 ? "85%" : "70%";
                profileDropdown.style.maxWidth = "280px";
                profileDropdown.style.maxHeight = "60vh";
                profileDropdown.style.overflowY = "auto";
            }
            const saveBtn = document.createElement("div");
            saveBtn.textContent = "💾 Save";
            Object.assign(saveBtn.style, {
                padding: isMobile ? "12px 8px" : "8px 12px",
                cursor: "pointer",
                fontSize: isMobile ? "14px" : "12px",
                display: "flex",
                alignItems: "center",
                gap: "8px"
            });
            saveBtn.onmouseover = () => { saveBtn.style.backgroundColor = colors.buttonHover; };
            saveBtn.onmouseout = () => { saveBtn.style.backgroundColor = "transparent"; };
            saveBtn.onclick = () => {
                const name = select.value;
                if (!name) {
                    showNotification(t('pickProfileFirst'), 'error');
                    return;
                }
                const profile = profiles.find(p => p.name === name);
                if (!profile) return;
                profile.positive = taPositive.value.trim();
                profile.negative = taNegative.value.trim();
                saveToStorage();
                showNotification(t('savedProfile', name), 'success');
                profileDropdown.style.display = "none";
            };

            const newBtn = document.createElement("div");
            newBtn.textContent = "🆕 New";
            Object.assign(newBtn.style, {
                padding: isMobile ? "12px 8px" : "8px 12px",
                cursor: "pointer",
                fontSize: isMobile ? "14px" : "12px",
                display: "flex",
                alignItems: "center",
                gap: "8px"
            });
            newBtn.onmouseover = () => { newBtn.style.backgroundColor = colors.buttonHover; };
            newBtn.onmouseout = () => { newBtn.style.backgroundColor = "transparent"; };
            newBtn.onclick = () => {
                const name = prompt(t('enterProfileName'));
                if (!name) return;
                if (profiles.some(p => p.name === name)) {
                    showNotification(t('profileExists', name), 'error');
                    return;
                }
                const newProfile = {
                    name, positive: taPositive.value.trim(), negative: taNegative.value.trim(), characters: []
                };
                profiles.push(newProfile);
                saveToStorage();
                updateSelectOptions(select, name);
                showNotification(t('createdProfile', name), 'success');
                profileDropdown.style.display = "none";
            };

            const renameBtn = document.createElement("div");
            renameBtn.textContent = "✏️ Rename";
            Object.assign(renameBtn.style, {
                padding: isMobile ? "12px 8px" : "8px 12px",
                cursor: "pointer",
                fontSize: isMobile ? "14px" : "12px",
                display: "flex",
                alignItems: "center",
                gap: "8px"
            });
            renameBtn.onmouseover = () => { renameBtn.style.backgroundColor = colors.buttonHover; };
            renameBtn.onmouseout = () => { renameBtn.style.backgroundColor = "transparent"; };
            renameBtn.onclick = () => {
                const name = select.value;
                if (!name) {
                    showNotification(t('pickProfileFirst'), 'error');
                    return;
                }
                const newName = prompt(t('renamePrompt'), name);
                if (!newName || newName === name) return;
                if (profiles.some(p => p.name === newName)) {
                    showNotification(t('renameTaken', newName), 'error');
                    return;
                }
                const profile = profiles.find(p => p.name === name);
                if (profile) {
                    profile.name = newName;
                    saveToStorage();
                    updateSelectOptions(select, newName);
                    if (lastProfileName === name) setLastProfile(newName);
                    showNotification(t('renamed', name, newName), 'success');
                }
                profileDropdown.style.display = "none";
            };

            const deleteBtn = document.createElement("div");
            deleteBtn.textContent = "🗑️ Delete";
            Object.assign(deleteBtn.style, {
                padding: isMobile ? "12px 8px" : "8px 12px",
                cursor: "pointer",
                fontSize: isMobile ? "14px" : "12px",
                display: "flex",
                alignItems: "center",
                gap: "8px"
            });
            deleteBtn.onmouseover = () => { deleteBtn.style.backgroundColor = colors.deleteHover; };
            deleteBtn.onmouseout = () => { deleteBtn.style.backgroundColor = "transparent"; };
            deleteBtn.onclick = () => {
                const name = select.value;
                if (!name) {
                    showNotification(t('pickProfileFirst'), 'error');
                    return;
                }
                if (!confirm(t('confirmDelete', name))) return;
                const idx = profiles.findIndex(p => p.name === name);
                if (idx !== -1) {
                    profiles.splice(idx, 1);
                    saveToStorage();
                    if (profiles.length === 0) {
                        updateSelectOptions(select);
                        taPositive.value = ""; taNegative.value = ""; charsList.innerHTML = "";
                        showNotification(t('deletedNone', name), 'info');
                    } else {
                        const newSel = profiles[Math.max(0, idx - 1)].name;
                        updateSelectOptions(select, newSel);
                        if (lastProfileName === name) setLastProfile(newSel);
                        showNotification(t('deletedSwitched', name, newSel), 'info');
                    }
                }
                profileDropdown.style.display = "none";
            };

            const swapBtn = document.createElement("div");
            swapBtn.textContent = "🔁 Swap Position";
            Object.assign(swapBtn.style, {
                padding: isMobile ? "12px 8px" : "8px 12px",
                cursor: "pointer",
                fontSize: isMobile ? "14px" : "12px",
                display: "flex",
                alignItems: "center",
                gap: "8px"
            });
            swapBtn.onmouseover = () => { swapBtn.style.backgroundColor = colors.buttonHover; };
            swapBtn.onmouseout = () => { swapBtn.style.backgroundColor = "transparent"; };
            swapBtn.onclick = () => {
                const name = select.value;
                if (!name) {
                    showNotification(t('pickProfileFirst'), 'error');
                    return;
                }

                const currentIndex = profiles.findIndex(p => p.name === name);
                const input = prompt(t('swapPrompt'));
                if (!input) return;

                const targetIndex = parseInt(input) - 1;

                if (isNaN(targetIndex) || targetIndex < 0 || targetIndex >= profiles.length) {
                    showNotification(t('invalidPos'), 'error');
                    return;
                }

                if (currentIndex === targetIndex) {
                    showNotification(t('alreadyThere'), 'info');
                    return;
                }
                [profiles[currentIndex], profiles[targetIndex]] = [profiles[targetIndex], profiles[currentIndex]];
                saveToStorage();
                updateSelectOptions(select, name);

                showNotification(t('swapped', currentIndex + 1, targetIndex + 1), 'success');
                profileDropdown.style.display = "none";
            };

            const clearAllBtn = document.createElement("div");
            clearAllBtn.textContent = "💥 Clear All";
            Object.assign(clearAllBtn.style, {
                padding: isMobile ? "12px 8px" : "8px 12px",
                cursor: "pointer",
                fontSize: isMobile ? "14px" : "12px",
                display: "flex",
                alignItems: "center",
                gap: "8px"
            });
            clearAllBtn.onmouseover = () => { clearAllBtn.style.backgroundColor = colors.deleteHover; };
            clearAllBtn.onmouseout = () => { clearAllBtn.style.backgroundColor = "transparent"; };
            clearAllBtn.onclick = () => {
                if (!confirm(t('confirmClearAll'))) return;
                profiles = []; saveToStorage(); updateSelectOptions(select);
                taPositive.value = ""; taNegative.value = ""; charsList.innerHTML = "";
                showNotification(t('clearedAll'), 'info');
                profileDropdown.style.display = "none";
            };
            if (isMobile) {
                const closeDropdownBtn = document.createElement("div");
                closeDropdownBtn.textContent = t('close');
                Object.assign(closeDropdownBtn.style, {
                    padding: "12px 8px",
                    cursor: "pointer",
                    fontSize: "14px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    backgroundColor: colors.deleteBackground,
                    color: "white",
                    borderRadius: "6px",
                    marginTop: "8px",
                    fontWeight: "bold"
                });
                const handleDropdownClose = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    profileDropdown.style.display = "none";
                };
                closeDropdownBtn.onclick = handleDropdownClose;
                closeDropdownBtn.addEventListener('touchend', handleDropdownClose, { passive: false });

                const dropdownHeader = document.createElement("div");
                dropdownHeader.style.display = "flex";
                dropdownHeader.style.justifyContent = "space-between";
                dropdownHeader.style.alignItems = "center";
                dropdownHeader.style.padding = "8px 12px";
                dropdownHeader.style.borderBottom = `1px solid ${colors.borderColor}`;
                dropdownHeader.style.marginBottom = "4px";

                const dropdownTitle = document.createElement("div");
                dropdownTitle.textContent = "Profile Options";
                dropdownTitle.style.fontWeight = "bold";
                dropdownTitle.style.fontSize = "16px";

                dropdownHeader.appendChild(dropdownTitle);
                dropdownHeader.appendChild(closeDropdownBtn);

                profileDropdown.appendChild(dropdownHeader);
            }

            profileDropdown.appendChild(saveBtn);
            profileDropdown.appendChild(newBtn);
            profileDropdown.appendChild(renameBtn);
            profileDropdown.appendChild(deleteBtn);
            profileDropdown.appendChild(swapBtn);
            profileDropdown.appendChild(clearAllBtn);

            profileMenuBtn.appendChild(profileDropdown);
            profileMenuBtn.onclick = (e) => {
                e.stopPropagation();
                profileDropdown.style.display = profileDropdown.style.display === "none" ? "block" : "none";
            };

            profileMenuRow.appendChild(profileMenuBtn);
            profileTab.appendChild(profileMenuRow);

            const taDiv = document.createElement("div");
            taDiv.style.marginBottom = "8px";
            taPositive = document.createElement("textarea");
            taPositive.placeholder = t('positivePlaceholder');
            Object.assign(taPositive.style, {
                width: "100%", height: isMobile ? "120px" : "100px", padding: isMobile ? "10px" : "6px", borderRadius: "6px",
                border: `1px solid ${colors.borderColor}`, background: colors.inputBackground,
                color: colors.inputColor, resize: "vertical", fontSize: isMobile ? "14px" : "12px", fontFamily: "monospace"
            });
            taDiv.appendChild(taPositive);
            taNegative = document.createElement("textarea");
            taNegative.placeholder = t('negativePlaceholder');
            Object.assign(taNegative.style, {
                width: "100%", height: isMobile ? "80px" : "60px", padding: isMobile ? "10px" : "6px", borderRadius: "6px",
                border: `1px solid ${colors.borderColor}`, background: colors.inputBackground,
                color: colors.inputColor, resize: "vertical", fontSize: isMobile ? "14px" : "12px", fontFamily: "monospace", marginTop: "6px"
            });
            taDiv.appendChild(taNegative);
            profileTab.appendChild(taDiv);

            // --- START: MODIFIED IMAGE SETTINGS SECTION ---
            const imageSettingsContainer = document.createElement("div");
            imageSettingsContainer.className = "image-settings-container";

            // MOBILE FIX: Hide image settings for mobile users
            if (isMobile) {
                imageSettingsContainer.style.display = "none";
            }

            // Row: Steps, Guidance, and Apply Button in one line
            const settingsRow = document.createElement("div");
            settingsRow.className = "image-settings-row";
            settingsRow.style.display = "flex";
            settingsRow.style.alignItems = "center";
            settingsRow.style.gap = "8px";

            // Steps
            const stepsContainer = document.createElement("div");
            stepsContainer.style.display = "flex";
            stepsContainer.style.alignItems = "center";
            stepsContainer.style.gap = "4px";

            const stepsLabel = document.createElement("span");
            stepsLabel.textContent = t('steps');
            stepsLabel.style.fontSize = isMobile ? "12px" : "13px";
            stepsLabel.style.marginRight = "4px";

            const stepsInput = document.createElement("input");
            stepsInput.type = "number";
            stepsInput.className = "image-setting-input";
            stepsInput.style.width = isMobile ? "60px" : "40px";
            stepsInput.style.padding = "4px";
            stepsInput.style.borderRadius = "4px";
            stepsInput.style.border = "1px solid #475569";
            stepsInput.style.background = "#1e293b";
            stepsInput.style.color = "#e2e8f0";
            stepsInput.style.fontSize = isMobile ? "12px" : "13px";
            stepsInput.min = "1";
            stepsInput.max = "50";
            stepsInput.value = imageSettings.steps;
            stepsInput.addEventListener('change', () => {
                imageSettings.steps = parseInt(stepsInput.value) || 28;
                saveImageSettings();
            });

            stepsContainer.appendChild(stepsLabel);
            stepsContainer.appendChild(stepsInput);

            // Separator
            const separator1 = document.createElement("span");
            separator1.textContent = "|";
            separator1.style.margin = "0 4px";
            separator1.style.color = "#94a3b8";

            // Guidance
            const guidanceContainer = document.createElement("div");
            guidanceContainer.style.display = "flex";
            guidanceContainer.style.alignItems = "center";
            guidanceContainer.style.gap = "4px";

            const guidanceLabel = document.createElement("span");
            guidanceLabel.textContent = t('guidance');
            guidanceLabel.style.fontSize = isMobile ? "12px" : "13px";
            guidanceLabel.style.marginRight = "4px";

            const guidanceInput = document.createElement("input");
            guidanceInput.type = "number";
            guidanceInput.className = "image-setting-input";
            guidanceInput.style.width = isMobile ? "60px" : "40px";
            guidanceInput.style.padding = "4px";
            guidanceInput.style.borderRadius = "4px";
            guidanceInput.style.border = "1px solid #475569";
            guidanceInput.style.background = "#1e293b";
            guidanceInput.style.color = "#e2e8f0";
            guidanceInput.style.fontSize = isMobile ? "12px" : "13px";
            guidanceInput.min = "1";
            guidanceInput.max = "20";
            guidanceInput.step = "0.1";
            guidanceInput.value = imageSettings.guidance;
            guidanceInput.addEventListener('change', () => {
                imageSettings.guidance = parseFloat(guidanceInput.value) || 5.0;
                saveImageSettings();
            });

            guidanceContainer.appendChild(guidanceLabel);
            guidanceContainer.appendChild(guidanceInput);

            // Separator
            const separator2 = document.createElement("span");
            separator2.textContent = "|";
            separator2.style.margin = "0 4px";
            separator2.style.color = "#94a3b8";

            // Apply Button with Checkmark Icon
            const applySettingsBtn = document.createElement("button");
            applySettingsBtn.innerHTML = "✅"; // Using checkmark icon instead of text
            applySettingsBtn.className = "nai-responsive-button";
            applySettingsBtn.style.padding = isMobile ? "6px 8px" : "4px 8px";
            applySettingsBtn.style.borderRadius = "4px";
            applySettingsBtn.style.border = "none";
            applySettingsBtn.style.background = "#3b82f6";
            applySettingsBtn.style.color = "white";
            applySettingsBtn.style.cursor = "pointer";
            applySettingsBtn.style.fontSize = isMobile ? "14px" : "16px";
            applySettingsBtn.style.display = "flex";
            applySettingsBtn.style.alignItems = "center";
            applySettingsBtn.style.justifyContent = "center";
            applySettingsBtn.addEventListener('click', applyImageSettings);

            // Add all elements to the settings row
            settingsRow.appendChild(stepsContainer);
            settingsRow.appendChild(separator1);
            settingsRow.appendChild(guidanceContainer);
            settingsRow.appendChild(separator2);
            settingsRow.appendChild(applySettingsBtn);

            imageSettingsContainer.appendChild(settingsRow);

            // Add the image settings container to the profileTab
            profileTab.appendChild(imageSettingsContainer);
            // --- END: MODIFIED IMAGE SETTINGS SECTION ---

            const generateBtn = document.createElement("button");
            generateBtn.textContent = t('generate');
            generateBtn.className = "nai-responsive-button";
            Object.assign(generateBtn.style, {
    width: "100%",
    padding: isMobile ? "12px" : "6px",
    borderRadius: "6px",
    border: "1px solid #7c7850",
    backgroundColor: "rgb(245, 243, 194)",
    color: "black",
    cursor: "pointer",
    fontSize: isMobile ? "14px" : "12px",
    fontWeight: "bold",
    marginTop: "6px",
    fontFamily: "inherit",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
    minHeight: isMobile ? "44px" : "auto"
});
generateBtn.onmouseover = () => {
    generateBtn.style.backgroundColor = "#e8e5b0";
};
generateBtn.onmouseout = () => {
    generateBtn.style.backgroundColor = "rgb(245, 243, 194)";
};

            // MOBILE FIX: Hide Generate button for mobile users
            if (isMobile) {
                generateBtn.style.display = "none";
            }

            generateBtn.onclick = () => {
                // Apply image settings before generating
                applyImageSettings();

                const findGenerateButton = () => {
                    let btn = document.querySelector('.common__GenerateButtonMain-sc-883533e0-3');
                    if (btn) {
                        return btn;
                    }
                    btn = document.querySelector('[class*="GenerateButtonMain"]');
                    if (btn) {
                        return btn;
                    }
                    const buttonsWithSpan = document.querySelectorAll('button span');
                    for (const span of buttonsWithSpan) {
                        if (span.textContent && span.textContent.toLowerCase().includes('generate')) {
                            return span.parentElement;
                        }
                    }
                    const allButtons = document.querySelectorAll('button');
                    for (const button of allButtons) {
                        if (button.textContent && button.textContent.toLowerCase().includes('generate')) {
                            return button;
                        }
                    }

                    return null;
                };
                const clickButtonRobustly = (btn) => {
                    if (!btn) return;
                    showNotification('🎨 Generating image...', 'info');
                    try {
                        btn.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        setTimeout(() => {
                            btn.focus();
                            btn.click();
                        }, 150);
                    } catch (e) {
                        console.error('NAI: Standard click failed, trying event dispatch.', e);
                        ['mousedown', 'mouseup', 'click'].forEach(eventType => {
                            btn.dispatchEvent(new MouseEvent(eventType, {
                                view: window,
                                bubbles: true,
                                cancelable: true,
                                buttons: 1
                            }));
                        });
                    }
                };
                const attemptClick = () => {
                    const button = findGenerateButton();
                    if (button) {
                        clickButtonRobustly(button);
                        return true;
                    }
                    return false;
                };
                if (!attemptClick()) {
                    setTimeout(attemptClick, 500);
                    setTimeout(attemptClick, 1500);
                    setTimeout(() => {
                        if (!attemptClick()) {
                            showNotification('❌ Could not find or click the generate button. The page structure might have changed.', 'error');
                        }
                    }, 3000);
                }
            };
            profileTab.appendChild(generateBtn);

            tabContent.appendChild(profileTab);
            const characterTab = document.createElement("div");
            characterTab.id = "tab-character";
            characterTab.className = "tab-content";
            characterTab.style.display = "none";

            const charSection = document.createElement("div");
            charSection.style.marginBottom = "8px";
            const charHeader = document.createElement("div");
            charHeader.style.display = "flex"; charHeader.style.justifyContent = "space-between";
            charHeader.style.alignItems = "center"; charHeader.style.marginBottom = "6px";
            const charTitle = document.createElement("h4");
            charTitle.style.margin = "0"; charTitle.style.fontSize = isMobile ? "15px" : "13px"; charTitle.style.fontWeight = "bold";
            charTitle.textContent = "Characters";
            const addCharBtn = document.createElement("button");
            addCharBtn.textContent = t('addCharacter');
            addCharBtn.className = "nai-responsive-button";
            Object.assign(addCharBtn.style, {
                padding: isMobile ? "8px 12px" : "4px 8px", borderRadius: "4px", border: "none",
                background: colors.buttonBackground, color: "white", cursor: "pointer", fontSize: isMobile ? "12px" : "11px"
            });
            addCharBtn.onclick = () => {
                const name = select.value;
                if (!name) {
                    showNotification(t('pickProfileFirst'), 'error');
                    return;
                }
                const profile = profiles.find(p => p.name === name);
                if (profile) openCharacterModal(profile);
            };
            charHeader.appendChild(charTitle); charHeader.appendChild(addCharBtn);
            charSection.appendChild(charHeader);
            charsList = document.createElement("div");
            charsList.style.minHeight = "40px";
            charSection.appendChild(charsList);
            charWarning = document.createElement("div");
            charWarning.style.display = "none";
            charSection.appendChild(charWarning);
            characterTab.appendChild(charSection);
            const charDBSection = document.createElement("div");
            charDBSection.style.marginTop = "16px";
            const charDBHeader = document.createElement("div");
            charDBHeader.style.display = "flex"; charDBHeader.style.justifyContent = "space-between";
            charDBHeader.style.alignItems = "center"; charDBHeader.style.marginBottom = "6px";
            const charDBTitle = document.createElement("h4");
            charDBTitle.style.margin = "0"; charDBTitle.style.fontSize = isMobile ? "15px" : "13px"; charDBTitle.style.fontWeight = "bold";
            charDBTitle.textContent = "Character Database";
            const buttonContainer = document.createElement("div");
            buttonContainer.style.display = "flex";
            buttonContainer.style.gap = "6px";

            const addCharDBBtn = document.createElement("button");
            addCharDBBtn.textContent = "Add to DB";
            addCharDBBtn.className = "nai-responsive-button";
            Object.assign(addCharDBBtn.style, {
                padding: isMobile ? "8px 12px" : "4px 8px", borderRadius: "4px", border: "none",
                background: colors.buttonBackground, color: "white", cursor: "pointer", fontSize: isMobile ? "12px" : "11px"
            });
            addCharDBBtn.onclick = () => openCharacterDBModal();
            const organizeCharDBBtn = document.createElement("button");
            organizeCharDBBtn.textContent = t('organizeCharDB');
            organizeCharDBBtn.className = "nai-responsive-button";
            Object.assign(organizeCharDBBtn.style, {
                padding: isMobile ? "8px 12px" : "4px 8px",
                borderRadius: "4px",
                border: "none",
                background: "#64748b",
                color: "white",
                cursor: "pointer",
                fontSize: isMobile ? "12px" : "11px"
            });
            organizeCharDBBtn.onclick = () => openOrganizeCharDBModal();

            buttonContainer.appendChild(addCharDBBtn);
            buttonContainer.appendChild(organizeCharDBBtn);

            charDBHeader.appendChild(charDBTitle);
            charDBHeader.appendChild(buttonContainer);
            charDBSection.appendChild(charDBHeader);
            const charDBSelectContainer = document.createElement("div");
            charDBSelectContainer.style.display = "flex";
            charDBSelectContainer.style.gap = "6px";
            charDBSelectContainer.style.marginBottom = "8px";

            charDBSelect = document.createElement("select");
            Object.assign(charDBSelect.style, {
                flex: "1",
                padding: isMobile ? "10px" : "6px",
                borderRadius: "6px",
                border: `1px solid ${colors.borderColor}`,
                background: colors.inputBackground,
                color: colors.inputColor,
                fontSize: isMobile ? "14px" : "13px"
            });

            const addSelectedBtn = document.createElement("button");
            addSelectedBtn.textContent = t('addSelected');
            addSelectedBtn.className = "nai-responsive-button";
            Object.assign(addSelectedBtn.style, {
                padding: isMobile ? "10px 12px" : "6px 12px",
                borderRadius: "6px",
                border: "none",
                background: colors.buttonBackground,
                color: "white",
                cursor: "pointer",
                fontSize: isMobile ? "14px" : "12px",
                fontWeight: "bold"
            });
            addSelectedBtn.onclick = () => {
                const selectedCharName = charDBSelect.value;
                if (!selectedCharName) {
                    showNotification(t('pickProfileFirst'), 'error');
                    return;
                }
                const profile = profiles.find(p => p.name === select.value);
                if (profile) {
                    profile.characters.push({ name: selectedCharName, prompt: characterDatabase[selectedCharName] });
                    saveToStorage();
                    updateCharListUI();
                    insertCharacterPrompts(profile.characters, charWarning);
                    showNotification(`✅ Added "${selectedCharName}" to profile`, 'success');
                } else {
                    showNotification(t('pickProfileFirst'), 'error');
                }
            };

            charDBSelectContainer.appendChild(charDBSelect);
            charDBSelectContainer.appendChild(addSelectedBtn);
            charDBSection.appendChild(charDBSelectContainer);
            charDBSearchInput = document.createElement("input");
            charDBSearchInput.type = "text";
            charDBSearchInput.placeholder = t('searchCharDB');
            Object.assign(charDBSearchInput.style, {
                width: "100%",
                padding: isMobile ? "10px" : "6px",
                borderRadius: "6px",
                border: `1px solid ${colors.borderColor}`,
                background: colors.inputBackground,
                color: colors.inputColor,
                fontSize: isMobile ? "14px" : "13px",
                marginBottom: "8px"
            });
            charDBSearchInput.addEventListener('input', () => {
                updateCharDBUI(charDBSearchInput.value);
            });
            charDBSection.appendChild(charDBSearchInput);

            characterTab.appendChild(charDBSection);

            tabContent.appendChild(characterTab);
            const utilityTab = document.createElement("div");
            utilityTab.id = "tab-utility";
            utilityTab.className = "tab-content";
            utilityTab.style.display = "none";
            const utilityBtnRow = document.createElement("div");
            utilityBtnRow.style.display = "flex"; utilityBtnRow.style.gap = "6px"; utilityBtnRow.style.marginBottom = "8px";
            if (isMobile) utilityBtnRow.style.flexDirection = "column";

            const danbooruBtn = document.createElement("button");
            danbooruBtn.textContent = t('danbooru');
            danbooruBtn.className = "nai-responsive-button";
            Object.assign(danbooruBtn.style, {
                flex: "1", padding: isMobile ? "12px" : "6px", borderRadius: "6px", border: "none",
                background: colors.buttonBackground, color: "white", cursor: "pointer", fontSize: isMobile ? "14px" : "12px",
                minHeight: isMobile ? "44px" : "auto"
            });
danbooruBtn.onclick = () => {
    const idStr = prompt(t('danbooruPrompt', lastId));
    if (!idStr) return;
    if (!/^\d+$/.test(idStr)) {
        showNotification(t('danbooruInvalidId'), 'error');
        return;
    }
    const id = parseInt(idStr, 10);
    lastId = idStr; localStorage.setItem(LAST_ID_KEY, idStr);
    showNotification(t('danbooruFetching', id), 'info');
    fetch(`https://danbooru.donmai.us/posts/${id}.json`)
        .then(r => r.json())
        .then(data => {
            if (!data) {
                showNotification(t('danbooruError', "No data"), 'error');
                return;
            }
            const characterTags = data.tag_string_character ? data.tag_string_character.split(' ').map(tag => tag.replace(/_/g, ' ')) : [];
            const copyrightTags = data.tag_string_copyright ? data.tag_string_copyright.split(' ').map(tag => tag.replace(/_/g, ' ')) : [];
            const generalTags = data.tag_string_general ? data.tag_string_general.split(' ').map(tag => tag.replace(/_/g, ' ')) : [];
            let allTags = [...characterTags, ...copyrightTags, ...generalTags];
            if (blacklistTags.length > 0) {
                allTags = allTags.filter(t => !blacklistTags.includes(t.toLowerCase()));
            }
            const tagsString = allTags.join(', ');

            showNotification(t('danbooruApplying', id), 'info');
            if (!applyTextToEditor(tagsString, status)) {
                showNotification(t('danbooruApplyFail'), 'error');
            }
        })
        .catch(err => {
            console.error(err);
            showNotification(t('danbooruError', err.message || "Network error"), 'error');
        });
};

            const backupBtn = document.createElement("button");
            backupBtn.textContent = t('fullBackup');
            backupBtn.className = "nai-responsive-button";
            Object.assign(backupBtn.style, {
                flex: "1", padding: isMobile ? "12px" : "6px", borderRadius: "6px", border: "none",
                background: colors.buttonBackground, color: "white", cursor: "pointer", fontSize: isMobile ? "14px" : "12px",
                minHeight: isMobile ? "44px" : "auto"
            });
            backupBtn.onclick = () => {
                const data = { profiles, blacklistTags, globalVariables, wildcards, wildcardRemaining, characterDatabase, version: "3.0.3-notification-fix" };
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `nai-profiles-backup-${new Date().toISOString().slice(0, 10)}.json`;
                a.click();
                URL.revokeObjectURL(url);
                showNotification(t('backupSaved'), 'success');
            };

            utilityBtnRow.appendChild(danbooruBtn); utilityBtnRow.appendChild(backupBtn);
            utilityTab.appendChild(utilityBtnRow);
            const restoreBtn = document.createElement("button");
            restoreBtn.textContent = t('fullRestore');
            restoreBtn.className = "nai-responsive-button";
            Object.assign(restoreBtn.style, {
                width: "100%", padding: isMobile ? "12px" : "6px", borderRadius: "6px", border: "none",
                background: colors.buttonBackground, color: "white", cursor: "pointer", fontSize: isMobile ? "14px" : "12px", marginBottom: "8px",
                minHeight: isMobile ? "44px" : "auto"
            });
restoreBtn.onclick = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = () => {
        const file = input.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            try {
                const rawData = reader.result;
                let data;
                try {
                    data = JSON.parse(rawData);
                } catch (e) {
                    showNotification(t('restoreInvalid'), 'error');
                    return;
                }
                let importedProfiles = [];
                let importedBlacklist = [];
                let importedGlobalVars = {};
                let importedWildcards = {};
                let importedWildcardRemaining = {};
                let importedCharDB = {};
                if (Array.isArray(data)) {
                    importedProfiles = data
                        .filter(p => p && p.name)
                        .map(p => ({
                            name: p.name,
                            positive: p.content || "",
                            negative: "",
                            characters: []
                        }));
                    showNotification(t('restoreLegacy'), 'info');

                } else if (data.version && data.version.startsWith("2.")) {
                    if (Array.isArray(data.profiles)) {
                        importedProfiles = data.profiles.map(p => ({
                            name: p.name,
                            positive: p.content || p.positive || "",
                            negative: p.negative || "",
                            characters: Array.isArray(p.characters) ? p.characters : []
                        }));
                    }
                    if (Array.isArray(data.blacklist)) {
                        importedBlacklist = data.blacklist.map(t => t.trim()).filter(t => t);
                    }
                    if (typeof data.globalVariables === "object" && data.globalVariables !== null) {
                        importedGlobalVars = { ...data.globalVariables };
                    }
                    if (typeof data.wildcards === "object" && data.wildcards !== null) {
                        importedWildcards = { ...data.wildcards };
                    }
                    if (data.lastProfile) {
                        setLastProfile(data.lastProfile);
                    }
                    showNotification(t('restoreSuccess'), 'success');

                } else if (data.profiles && Array.isArray(data.profiles)) {
                    importedProfiles = data.profiles;
                    if (Array.isArray(data.blacklistTags)) {
                        importedBlacklist = data.blacklistTags;
                    }
                    if (typeof data.globalVariables === "object") {
                        importedGlobalVars = data.globalVariables;
                    }
                    if (typeof data.wildcards === "object") {
                        importedWildcards = data.wildcards;
                    }
                    if (typeof data.wildcardRemaining === "object") {
                        importedWildcardRemaining = data.wildcardRemaining;
                    }
                    if (typeof data.characterDatabase === "object") {
                        importedCharDB = data.characterDatabase;
                    }
                    if (typeof data.enableNotifications === "boolean") {
                        enableNotifications = data.enableNotifications;
                        localStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(enableNotifications));
                    }
                    showNotification(t('restoreSuccess'), 'success');
                } else {
                    showNotification(t('restoreInvalid'), 'error');
                    return;
                }
                importedProfiles = importedProfiles
                    .filter(p => p && p.name)
                    .map(p => ({
                        name: p.name,
                        positive: p.positive || p.content || "",
                        negative: p.negative || "",
                        characters: Array.isArray(p.characters) ? p.characters : []
                    }));
                profiles = importedProfiles;
                blacklistTags = importedBlacklist;
                globalVariables = importedGlobalVars;
                wildcards = importedWildcards;
                wildcardRemaining = importedWildcardRemaining;
                characterDatabase = importedCharDB;
                saveToStorage();
                updateSelectOptions(select);
                if (profiles.length > 0) {
                    const first = profiles[0];
                    taPositive.value = first.positive || "";
                    taNegative.value = first.negative || "";
                    updateCharListUI();
                    updateCharDBUI();
                }

            } catch (e) {
                console.error("Restore error:", e);
                showNotification(t('restoreInvalid'), 'error');
            }
        };
        reader.readAsText(file);
    };
    input.click();
};
            utilityTab.appendChild(restoreBtn);

            tabContent.appendChild(utilityTab);
            const settingsTab = document.createElement("div");
            settingsTab.id = "tab-settings";
            settingsTab.className = "tab-content";
            settingsTab.style.display = "none";

            const settingsBtn = document.createElement("button");
            settingsBtn.textContent = t('settingsBlacklist');
            settingsBtn.className = "nai-responsive-button";
            Object.assign(settingsBtn.style, {
                width: "100%", padding: isMobile ? "12px" : "6px", borderRadius: "6px", border: "none",
                background: colors.buttonBackground, color: "white", cursor: "pointer", fontSize: isMobile ? "14px" : "12px",
                minHeight: isMobile ? "44px" : "auto"
            });
settingsBtn.onclick = () => {
    if (document.getElementById('nai-settings-modal')) return;
    const colors = getThemeColors();
    const modal = document.createElement('div');
    modal.id = 'nai-settings-modal';
    Object.assign(modal.style, {
        position: 'fixed', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)', width: isMobile ? '90%' : '500px', maxWidth: '90vw',
        background: colors.background, color: colors.color,
        border: `1px solid ${colors.borderColor}`, borderRadius: '12px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.2)', zIndex: '20000',
        padding: '20px', fontFamily: 'sans-serif', boxSizing: 'border-box',
        maxHeight: isMobile ? '80vh' : 'none',
        overflowY: isMobile ? 'auto' : 'none'
    });

    const checkboxStyle = document.createElement('style');
    checkboxStyle.textContent = `
        .custom-checkbox {
            position: relative;
            display: inline-block;
            width: 20px;
            height: 20px;
            margin-right: 8px;
            vertical-align: middle;
        }

        .custom-checkbox input {
            opacity: 0;
            width: 0;
            height: 0;
        }

        .checkmark {
            position: absolute;
            top: 0;
            left: 0;
            height: 20px;
            width: 20px;
            background-color: ${colors.inputBackground};
            border: 1px solid ${colors.borderColor};
            border-radius: 4px;
        }

        .custom-checkbox:hover input ~ .checkmark {
            background-color: ${colors.buttonHover};
        }

        .custom-checkbox input:checked ~ .checkmark {
            background-color: ${colors.buttonBackground};
        }

        .checkmark:after {
            content: "";
            position: absolute;
            display: none;
        }

        .custom-checkbox input:checked ~ .checkmark:after {
            display: block;
        }

        .custom-checkbox .checkmark:after {
            left: 7px;
            top: 3px;
            width: 5px;
            height: 10px;
            border: solid white;
            border-width: 0 2px 2px 0;
            transform: rotate(45deg);
        }
    `;
    document.head.appendChild(checkboxStyle);

    modal.innerHTML = `
        <div style="font-weight:bold; font-size:16px; margin-bottom:16px;">${t('settingsBlacklist')}</div>
        <div style="margin-bottom:16px;">
            <div style="margin:16px 0; display:flex; align-items:center; gap:8px;">
                <label for="enable-notifications" style="font-size:14px; cursor: pointer; white-space: nowrap; display: flex; align-items: center;">
                    <div class="custom-checkbox">
                        <input type="checkbox" id="enable-notifications">
                        <span class="checkmark"></span>
                    </div>
                    🔔 Enable Notifications
                </label>
            </div>
            <div style="font-weight:bold; margin-bottom:8px;">${t('globalVarsTitle')}</div>
            <div style="font-size:12px; opacity:0.8; margin-bottom:8px;">${t('globalVarsDesc')}</div>
            <textarea id="global-vars" rows="4" style="width:100%; padding:8px; border-radius:6px; border:1px solid ${colors.borderColor}; background:${colors.inputBackground}; color:${colors.inputColor}; font-size:13px; resize:vertical;">${Object.entries(globalVariables).map(([k, v]) => `${k}=${v}`).join('\n')}</textarea>
        </div>
        <div style="margin-bottom:16px;">
            <div style="font-weight:bold; margin-bottom:8px;">${t('wildcardsTitle')}</div>
            <div style="font-size:12px; opacity:0.8; margin-bottom:8px;">${t('wildcardsDesc')}</div>
            <textarea id="wildcards" rows="4" style="width:100%; padding:8px; border-radius:6px; border:1px solid ${colors.borderColor}; background:${colors.inputBackground}; color:${colors.inputColor}; font-size:13px; resize:vertical;">${Object.entries(wildcards).map(([k, v]) => `${k}=${Array.isArray(v) ? v.join(', ') : v}`).join('\n')}</textarea>
        </div>
        <div style="margin-bottom:16px;">
            <div style="font-weight:bold; margin-bottom:8px;">${t('blacklistTitle')}</div>
            <div style="font-size:12px; opacity:0.8; margin-bottom:8px;">${t('blacklistDesc')}</div>
            <textarea id="blacklist" rows="3" placeholder="${t('blacklistPlaceholder')}" style="width:100%; padding:8px; border-radius:6px; border:1px solid ${colors.borderColor}; background:${colors.inputBackground}; color:${colors.inputColor}; font-size:13px; resize:vertical;">${blacklistTags.join(', ')}</textarea>
        </div>
        <div style="display:flex; gap:8px; justify-content:flex-end;">
            <button id="cancel-settings" style="padding:6px 12px; background:${colors.deleteBackground}; color:white; border:none; border-radius:6px; cursor:pointer;">${t('cancel')}</button>
            <button id="save-settings" style="padding:6px 12px; background:${colors.buttonBackground}; color:white; border:none; border-radius:6px; cursor:pointer;">${t('apply')}</button>
        </div>
    `;
    document.body.appendChild(modal);
    const cancelBtn = modal.querySelector('#cancel-settings');
    const saveBtn = modal.querySelector('#save-settings');
    const notificationCheckbox = modal.querySelector('#enable-notifications');
    notificationCheckbox.checked = enableNotifications;

    cancelBtn.onclick = () => {
        document.body.removeChild(modal);
        if (document.head.contains(checkboxStyle)) {
            document.head.removeChild(checkboxStyle);
        }
    };

    saveBtn.onclick = () => {
        const globalVarsText = modal.querySelector('#global-vars').value;
        const wildcardsText = modal.querySelector('#wildcards').value;
        const blacklistText = modal.querySelector('#blacklist').value;
        const notificationsEnabled = notificationCheckbox.checked;
        try {
            const newGlobalVars = {};
            globalVarsText.split('\n').forEach(line => {
                const eq = line.indexOf('=');
                if (eq > 0) {
                    const key = line.substring(0, eq).trim();
                    const value = line.substring(eq + 1).trim();
                    if (key) newGlobalVars[key] = value;
                }
            });
            globalVariables = newGlobalVars;
            const newWildcards = {};
            wildcardsText.split('\n').forEach(line => {
                const eq = line.indexOf('=');
                if (eq > 0) {
                    const key = line.substring(0, eq).trim();
                    const value = line.substring(eq + 1).trim();
                    if (key) {
                        newWildcards[key] = value.split(',').map(v => v.trim()).filter(v => v);
                    }
                }
            });
            wildcards = newWildcards;
            blacklistTags = blacklistText.split(',').map(t => t.trim()).filter(t => t);
            saveToStorage();
            showNotification(t('blacklistSaved', blacklistTags.length), 'success');
            enableNotifications = notificationsEnabled;
            localStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(enableNotifications));
        } catch (e) {
            console.error(e);
            showNotification("❌ Error saving settings.", 'error');
        }
        document.body.removeChild(modal);
        if (document.head.contains(checkboxStyle)) {
            document.head.removeChild(checkboxStyle);
        }
    };

    modal.addEventListener('click', e => {
        if (e.target === modal) {
            document.body.removeChild(modal);
            if (document.head.contains(checkboxStyle)) {
                document.head.removeChild(checkboxStyle);
            }
        }
    });
};
            settingsTab.appendChild(settingsBtn);

            tabContent.appendChild(settingsTab);

            status = document.createElement("div");
            Object.assign(status.style, {
                fontSize: isMobile ? "12px" : "11px", marginTop: "8px", textAlign: "center",
                minHeight: "16px", opacity: "0.7"
            });
            panelContent.appendChild(status);

            panel.appendChild(panelContent);
            function createIconButton(icon, title, onClick) {
                const btn = document.createElement("button");
                btn.innerHTML = icon;
                btn.title = title;
                Object.assign(btn.style, {
                    padding: "6px",
                    borderRadius: "6px",
                    border: "none",
                    background: colors.buttonBackground,
                    color: "white",
                    cursor: "pointer",
                    fontSize: "14px",
                    width: "32px",
                    height: "32px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                });
                btn.onclick = onClick;
                return btn;
            }
            minimizeBtn.onclick = () => {
                const content = document.getElementById("panel-content");
                if (content.style.display === "none") {
                    content.style.display = "block";
                    minimizeBtn.innerHTML = "−";
                    panel.style.height = "auto";
                } else {
                    content.style.display = "none";
                    minimizeBtn.innerHTML = "+";
                    panel.style.height = "40px";
                }
            };
            select.addEventListener("contextmenu", (e) => {
                e.preventDefault();
                const existingMenu = document.getElementById("profile-context-menu");
                if (existingMenu) {
                    document.body.removeChild(existingMenu);
                }
                const contextMenu = document.createElement("div");
                contextMenu.id = "profile-context-menu";
                Object.assign(contextMenu.style, {
                    position: "fixed",
                    left: `${e.clientX}px`,
                    top: `${e.clientY}px`,
                    backgroundColor: colors.inputBackground,
                    border: `1px solid ${colors.borderColor}`,
                    borderRadius: "6px",
                    padding: "4px 0",
                    zIndex: "1000",
                    minWidth: "150px",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.2)"
                });
                const options = [
                    { text: "💾 Save", action: () => {
                        const name = select.value;
                        if (!name) {
                            showNotification(t('pickProfileFirst'), 'error');
                            return;
                        }
                        const profile = profiles.find(p => p.name === name);
                        if (!profile) return;
                        profile.positive = taPositive.value.trim();
                        profile.negative = taNegative.value.trim();
                        saveToStorage();
                        showNotification(t('savedProfile', name), 'success');
                    } },
                    { text: "✏️ Rename", action: () => {
                        const name = select.value;
                        if (!name) {
                            showNotification(t('pickProfileFirst'), 'error');
                            return;
                        }
                        const newName = prompt(t('renamePrompt'), name);
                        if (!newName || newName === name) return;
                        if (profiles.some(p => p.name === newName)) {
                            showNotification(t('renameTaken', newName), 'error');
                            return;
                        }
                        const profile = profiles.find(p => p.name === name);
                        if (profile) {
                            profile.name = newName;
                            saveToStorage();
                            updateSelectOptions(select, newName);
                            if (lastProfileName === name) setLastProfile(newName);
                            showNotification(t('renamed', name, newName), 'success');
                        }
                    } },
                    { text: "🗑️ Delete", action: () => {
                        const name = select.value;
                        if (!name) {
                            showNotification(t('pickProfileFirst'), 'error');
                            return;
                        }
                        if (!confirm(t('confirmDelete', name))) return;
                        const idx = profiles.findIndex(p => p.name === name);
                        if (idx !== -1) {
                            profiles.splice(idx, 1);
                            saveToStorage();
                            if (profiles.length === 0) {
                                updateSelectOptions(select);
                                taPositive.value = ""; taNegative.value = ""; charsList.innerHTML = "";
                                showNotification(t('deletedNone', name), 'info');
                            } else {
                                const newSel = profiles[Math.max(0, idx - 1)].name;
                                updateSelectOptions(select, newSel);
                                if (lastProfileName === name) setLastProfile(newSel);
                                showNotification(t('deletedSwitched', name, newSel), 'info');
                            }
                        }
                    } },
                    { text: "🔁 Swap Position", action: () => {
                        const name = select.value;
                        if (!name) {
                            showNotification(t('pickProfileFirst'), 'error');
                            return;
                        }

                        const currentIndex = profiles.findIndex(p => p.name === name);
                        const input = prompt(t('swapPrompt'));
                        if (!input) return;

                        const targetIndex = parseInt(input) - 1;

                        if (isNaN(targetIndex) || targetIndex < 0 || targetIndex >= profiles.length) {
                            showNotification(t('invalidPos'), 'error');
                            return;
                        }

                        if (currentIndex === targetIndex) {
                            showNotification(t('alreadyThere'), 'info');
                            return;
                        }
                        [profiles[currentIndex], profiles[targetIndex]] = [profiles[targetIndex], profiles[currentIndex]];
                        saveToStorage();
                        updateSelectOptions(select, name);

                        showNotification(t('swapped', currentIndex + 1, targetIndex + 1), 'success');
                    } }
                ];

                options.forEach(option => {
                    const menuItem = document.createElement("div");
                    menuItem.textContent = option.text;
                    Object.assign(menuItem.style, {
                        padding: "8px 12px",
                        cursor: "pointer"
                    });
                    menuItem.onmouseover = () => { menuItem.style.backgroundColor = colors.buttonHover; };
                    menuItem.onmouseout = () => { menuItem.style.backgroundColor = "transparent"; };
                    menuItem.onclick = () => {
                        option.action();
                        document.body.removeChild(contextMenu);
                    };
                    contextMenu.appendChild(menuItem);
                });

                document.body.appendChild(contextMenu);
                document.addEventListener("click", function closeContextMenu() {
                    if (document.getElementById("profile-context-menu")) {
                        document.body.removeChild(contextMenu);
                    }
                    document.removeEventListener("click", closeContextMenu);
                });
            });
            searchInput.addEventListener('input', () => {
                const searchTerm = searchInput.value.trim().toLowerCase();
                if (!searchTerm) {
                    updateSelectOptions(select, select.value);
                    return;
                }
                let filteredProfiles = profiles.filter(p =>
                    p.name.toLowerCase().includes(searchTerm) ||
                    (p.positive && p.positive.toLowerCase().includes(searchTerm)) ||
                    (p.negative && p.negative.toLowerCase().includes(searchTerm))
                );

                updateSelectOptions(select, null, filteredProfiles);
            });

            select.addEventListener("change", () => {
                const name = select.value;
                if (!name) return;
                const profile = profiles.find(p => p.name === name);
                if (!profile) return;
                taPositive.value = profile.positive || "";
                taNegative.value = profile.negative || "";
                updateCharListUI();
                updateCharDBUI();
                setLastProfile(name);
            });
            updateSelectOptions(select, lastProfileName);
            if (lastProfileName) {
                const profile = profiles.find(p => p.name === lastProfileName);
                if (profile) {
                    taPositive.value = profile.positive || "";
                    taNegative.value = profile.negative || "";
                    updateCharListUI();
                    updateCharDBUI();
                }
            }
            panel.style.display = "block";
            updatePanelPosition();
            showNotification(t('ready'), 'success');
        }
        function updatePanelPosition() {
            if (!panel || !toggle) return;
            const toggleRect = toggle.getBoundingClientRect();
            let panelLeft = toggleRect.right + 10;
            let panelTop = toggleRect.top;

            if (isMobile) {
                panelLeft = (window.innerWidth - panel.offsetWidth) / 2;
                panelTop = (window.innerHeight - panel.offsetHeight) / 2;
                panelLeft = Math.max(10, Math.min(panelLeft, window.innerWidth - panel.offsetWidth - 10));
                panelTop = Math.max(10, Math.min(panelTop, window.innerHeight - panel.offsetHeight - 10));
            } else {
                if (panelLeft + 380 > window.innerWidth) panelLeft = toggleRect.left - 390;
                if (panelTop + 600 > window.innerHeight) panelTop = window.innerHeight - 610;
            }

            panel.style.left = `${panelLeft}px`;
            panel.style.top = `${panelTop}px`;
        }
        function updateCharListUI() {
            const name = select.value;
            const profile = profiles.find(p => p.name === name);
            if (!profile) {
                charsList.innerHTML = '';
                return;
            }
            charsList.innerHTML = '';
            if (profile.characters.length === 0) return;
            const colors = getThemeColors();
            const container = document.createElement('div');
            container.className = "char-list-container";
            container.style.maxHeight = isMobile ? '150px' : '120px';
            container.style.overflowY = 'auto';
            container.style.border = `1px solid ${colors.charListBorder}`;
            container.style.borderRadius = '6px';
            container.style.padding = '8px';
            container.style.marginBottom = '8px';
            container.style.backgroundColor = colors.charListBackground;
            profile.characters.forEach((char, idx) => {
                const item = document.createElement('div');
                item.style.display = 'flex';
                item.style.alignItems = 'center';
                item.style.justifyContent = 'space-between';
                item.style.padding = isMobile ? '8px' : '6px 8px';
                item.style.background = colors.charItemBackground;
                item.style.borderRadius = '4px';
                item.style.marginBottom = '4px';
                item.style.fontSize = isMobile ? '14px' : '13px';
                item.style.color = colors.charItemColor;
                const hasVars = extractVariables(char.prompt || '').length > 0;
                const hasWildcards = extractWildcards(char.prompt || '').length > 0;
                const indicator = (hasVars || hasWildcards) ? ' 🔧' : '';
                item.innerHTML = `
                    <span title="${char.prompt}" class="nai-responsive-text"><strong>${char.name}</strong>${indicator}</span>
                    <div style="display:flex; gap:4px;">
                        <button class="edit-char" style="padding:2px 6px; background:${colors.buttonBackground}; color:white; border:none; border-radius:4px; font-size:11px; cursor:pointer;">✏️️️</button>
                        <button class="move-up" style="padding:2px 6px; background:#64748b; color:white; border:none; border-radius:4px; font-size:11px; cursor:pointer;">↑</button>
                        <button class="move-down" style="padding:2px 6px; background:#64748b; color:white; border:none; border-radius:4px; font-size:11px; cursor:pointer;">↓</button>
                        <button class="remove-char" style="padding:2px 6px; background:${colors.deleteBackground}; color:white; border:none; border-radius:4px; font-size:11px; cursor:pointer;">✕</button>
                    </div>
                `;
                container.appendChild(item);
            });
            charsList.appendChild(container);
            container.querySelectorAll('.edit-char').forEach((btn, i) => {
                btn.onclick = () => {
                    const profile = profiles.find(p => p.name === select.value);
                    if (profile) openCharacterModal(profile, i);
                };
            });
            container.querySelectorAll('.move-up').forEach((btn, i) => {
                btn.onclick = () => {
                    const profile = profiles.find(p => p.name === select.value);
                    if (profile && i > 0) {
                        [profile.characters[i], profile.characters[i-1]] = [profile.characters[i-1], profile.characters[i]];
                        saveToStorage();
                        updateCharListUI();
                        if (profile.characters.length > 0) {
                            insertCharacterPrompts(profile.characters, charWarning);
                        }
                        showNotification(`✅ Order updated`, 'success');
                    }
                };
            });
            container.querySelectorAll('.move-down').forEach((btn, i) => {
                btn.onclick = () => {
                    const profile = profiles.find(p => p.name === select.value);
                    if (profile && i < profile.characters.length - 1) {
                        [profile.characters[i], profile.characters[i+1]] = [profile.characters[i+1], profile.characters[i]];
                        saveToStorage();
                        updateCharListUI();
                        if (profile.characters.length > 0) {
                            insertCharacterPrompts(profile.characters, charWarning);
                        }
                        showNotification(`✅ Order updated`, 'success');
                    }
                };
            });
            container.querySelectorAll('.remove-char').forEach((btn, i) => {
                btn.onclick = () => {
                    const profile = profiles.find(p => p.name === select.value);
                    if (profile) {
                        const name = profile.characters[i].name;
                        profile.characters.splice(i, 1);
                        saveToStorage();
                        updateCharListUI();
                        if (profile.characters.length > 0) {
                            insertCharacterPrompts(profile.characters, charWarning);
                        } else {
                            applyProcessedCharacterPrompts([], charWarning);
                        }
                        showNotification(`🗑️ "${name}" deleted`, 'info');
                    }
                };
            });
        }
        function openCharacterModal(profile, index = null) {
            if (document.getElementById('nai-character-modal')) return;
            const isNew = index === null;
            const character = isNew ? { name: '', prompt: '' } : profile.characters[index];
            const colors = getThemeColors();
            const modal = document.createElement('div');
            modal.id = 'nai-character-modal';
            Object.assign(modal.style, {
                position: 'fixed', top: '50%', left: '50%',
                transform: 'translate(-50%, -50%)', width: isMobile ? '90%' : '400px', maxWidth: '90vw',
                background: colors.background, color: colors.color,
                border: `1px solid ${colors.borderColor}`, borderRadius: '12px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.2)', zIndex: '20000',
                padding: '20px', fontFamily: 'sans-serif', boxSizing: 'border-box'
            });
            modal.innerHTML = `
                <div style="font-weight:bold; font-size:16px; margin-bottom:16px;">
                    ${isNew ? t('addCharacter') : t('editCharacter')}
                </div>
                <div style="margin-bottom:12px;"><label style="display:block; font-size:13px; margin-bottom:4px; opacity:0.9;">${t('charNameLabel')}</label><input type="text" id="char-name"
                           placeholder="${t('charNamePlaceholder')}"
                           value="${character.name}"
                           style="width:100%; padding:8px; border-radius:6px; border:1px solid ${colors.borderColor};
                                  background:${colors.inputBackground}; color:${colors.inputColor}; font-size:13px;" /></div>
                <div style="margin-bottom:16px;"><label style="display:block; font-size:13px; margin-bottom:4px; opacity:0.9;">${t('charPromptLabel')}</label><textarea id="char-prompt" rows="4"
                              placeholder="${t('charPromptPlaceholder')}"
                              style="width:100%; padding:8px; border-radius:6px; border:1px solid ${colors.borderColor}; background:${colors.inputBackground}; color:${colors.inputColor}; font-size:13px; resize:vertical;">${character.prompt}</textarea></div>
                <div style="display:flex; gap:8px; justify-content:flex-end;">
                    <button id="cancel" style="padding:6px 12px; background:${colors.deleteBackground}; color:white; border:none; border-radius:6px; cursor:pointer;">${t('cancel')}</button>
                    <button id="save" style="padding:6px 12px; background:${colors.buttonBackground}; color:white; border:none; border-radius:6px; cursor:pointer;">${t('apply')}</button>
                </div>
            `;
            document.body.appendChild(modal);
            const nameInput = modal.querySelector('#char-name');
            const promptInput = modal.querySelector('#char-prompt');
            const saveBtn = modal.querySelector('#save');
            const cancelBtn = modal.querySelector('#cancel');
            saveBtn.onclick = () => {
                const name = nameInput.value.trim();
                const prompt = promptInput.value.trim();
                if (!name) {
                    showNotification(t('charNamePlaceholder'), 'error');
                    return;
                }
                if (!prompt) {
                    showNotification(t('charPromptPlaceholder'), 'error');
                    return;
                }
                if (isNew) {
                    profile.characters.push({ name, prompt });
                } else {
                    profile.characters[index] = { name, prompt };
                }
                saveToStorage();
                updateCharListUI();
                if (profile.characters.length > 0) {
                    insertCharacterPrompts(profile.characters, charWarning);
                }
                document.body.removeChild(modal);
                showNotification(`✅ Character "${name}" ${isNew ? 'added' : 'updated'}`, 'success');
            };
            cancelBtn.onclick = () => document.body.removeChild(modal);
            modal.addEventListener('click', e => { if (e.target === modal) document.body.removeChild(modal); });
        }
        document.body.appendChild(toggle);
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && panel && panel.style.display === 'block') {
                panel.style.display = 'none';
                return;
            }
            if (e.ctrlKey && e.key === 'q') {
                e.preventDefault();
                if (panel && panel.style.display === 'none') {
                    panel.style.display = 'block';
                    updatePanelPosition();
                }
                if (searchDiv.style.display === 'none') {
                    searchDiv.style.display = 'block';
                    searchInput.focus();
                } else {
                    searchDiv.style.display = 'none';
                }
                return;
            }
            if (e.ctrlKey && e.key >= '0' && e.key <= '9') {
                e.preventDefault();
                const profileIndex = e.key === '0' ? 9 : parseInt(e.key) - 1;

                if (profileIndex < profiles.length) {
                    if (panel && panel.style.display === 'none') {
                        panel.style.display = 'block';
                        updatePanelPosition();
                    }
                    select.value = profiles[profileIndex].name;
                    const event = new Event('change');
                    select.dispatchEvent(event);
                    showNotification(`✅ Loaded profile #${profileIndex + 1}: ${profiles[profileIndex].name}`, 'success');
                } else {
                    showNotification(`❌ Profile #${profileIndex + 1} does not exist`, 'error');
                }
                return;
            }
        });
    }
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", createPanelOnce);
    } else {
        createPanelOnce();
    }
    window.addEventListener('popstate', () => {
        setTimeout(() => {
            const select = document.querySelector("#nai-profiles-panel select");
            if (select && select.value) {
                const event = new Event('change');
                select.dispatchEvent(event);
            }
        }, 1000);
    });
    setTimeout(() => {
        const select = document.querySelector("#nai-profiles-panel select");
        if (select && select.value) {
            const event = new Event('change');
            select.dispatchEvent(event);
        }
    }, 2000);
function addImageZoomFeature() {
    function handleImageClick(e) {
        e.preventDefault();
        const img = e.target;
        const imgSrc = img.src;
        const modal = document.createElement('div');
        modal.id = 'nai-image-zoom-modal';
        Object.assign(modal.style, {
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            zIndex: '99999',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            cursor: 'zoom-out',
            overflow: 'hidden',
            touchAction: 'none'
        });
        const imgContainer = document.createElement('div');
        Object.assign(imgContainer.style, {
            position: 'relative',
            width: '90%',
            height: '90%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            overflow: 'hidden'
        });
        const modalImg = document.createElement('img');
        modalImg.src = imgSrc;
        Object.assign(modalImg.style, {
            maxWidth: '100%',
            maxHeight: '100%',
            objectFit: 'contain',
            transform: 'scale(1) translate(0px, 0px)',
            transition: 'transform 0.1s ease-out',
            cursor: 'grab',
            userSelect: 'none',
            WebkitUserDrag: 'none',
            KhtmlUserDrag: 'none',
            MozUserDrag: 'none',
            OUserDrag: 'none'
        });
        const closeBtn = document.createElement('button');
        closeBtn.innerHTML = '✕';
        Object.assign(closeBtn.style, {
            position: 'absolute',
            top: '20px',
            right: '20px',
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            fontSize: '20px',
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: '1000'
        });
        const zoomInBtn = document.createElement('button');
        zoomInBtn.innerHTML = '+';
        Object.assign(zoomInBtn.style, {
            position: 'absolute',
            bottom: '20px',
            right: '80px',
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            fontSize: '24px',
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: '1000'
        });

        const zoomOutBtn = document.createElement('button');
        zoomOutBtn.innerHTML = '-';
        Object.assign(zoomOutBtn.style, {
            position: 'absolute',
            bottom: '20px',
            right: '20px',
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            fontSize: '24px',
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: '1000'
        });
        const resetBtn = document.createElement('button');
        resetBtn.innerHTML = '100%';
        Object.assign(resetBtn.style, {
            position: 'absolute',
            bottom: '20px',
            left: '20px',
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            padding: '8px 16px',
            fontSize: '14px',
            cursor: 'pointer',
            zIndex: '1000'
        });
        const zoomInfo = document.createElement('div');
        Object.assign(zoomInfo.style, {
            position: 'absolute',
            top: '20px',
            left: '20px',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            color: 'white',
            padding: '8px 12px',
            borderRadius: '4px',
            fontSize: '14px',
            zIndex: '1000'
        });
        zoomInfo.textContent = 'Zoom: 100%';
        imgContainer.appendChild(modalImg);
        modal.appendChild(imgContainer);
        modal.appendChild(closeBtn);
        modal.appendChild(zoomInBtn);
        modal.appendChild(zoomOutBtn);
        modal.appendChild(resetBtn);
        modal.appendChild(zoomInfo);
        document.body.appendChild(modal);

        let scale = 1;
        let translateX = 0;
        let translateY = 0;
        let isDragging = false;
        let startX, startY;
        let lastX, lastY;
        let initialDistance = 0;
        let initialScale = 1;

        modalImg.addEventListener('touchstart', (e) => {
            if (e.touches.length === 2) {
                initialDistance = Math.hypot(
                    e.touches[0].pageX - e.touches[1].pageX,
                    e.touches[0].pageY - e.touches[1].pageY
                );
                initialScale = scale;
            } else if (e.touches.length === 1 && scale > 1) {
                isDragging = true;
                modalImg.style.transition = 'none';
                startX = e.touches[0].clientX;
                startY = e.touches[0].clientY;
                lastX = translateX;
                lastY = translateY;
            }
            e.preventDefault();
        });

        modalImg.addEventListener('touchmove', (e) => {
            if (e.touches.length === 2) {
                const currentDistance = Math.hypot(
                    e.touches[0].pageX - e.touches[1].pageX,
                    e.touches[0].pageY - e.touches[1].pageY
                );

                if (initialDistance > 0) {
                    scale = Math.min(Math.max(0.5, initialScale * (currentDistance / initialDistance)), 5);
                    updateTransform();
                }
            } else if (e.touches.length === 1 && isDragging) {
                const deltaX = e.touches[0].clientX - startX;
                const deltaY = e.touches[0].clientY - startY;
                translateX = lastX + deltaX;
                translateY = lastY + deltaY;
                updateTransform();
            }
            e.preventDefault();
        });

        modalImg.addEventListener('touchend', (e) => {
            if (e.touches.length < 2) {
                isDragging = false;
                modalImg.style.transition = 'transform 0.1s ease-out';
            }
            e.preventDefault();
        });

        function updateTransform() {
            modalImg.style.transform = `scale(${scale}) translate(${translateX}px, ${translateY}px)`;
            zoomInfo.textContent = `Zoom: ${Math.round(scale * 100)}%`;
        }
        zoomInBtn.addEventListener('click', (e) => { e.stopPropagation(); scale = Math.min(scale + 0.25, 5); updateTransform(); });
        zoomOutBtn.addEventListener('click', (e) => { e.stopPropagation(); scale = Math.max(scale - 0.25, 0.5); updateTransform(); });
        resetBtn.addEventListener('click', (e) => { e.stopPropagation(); scale = 1; translateX = 0; translateY = 0; updateTransform(); });
        const closeModal = () => { document.body.removeChild(modal); };
        closeBtn.addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal || e.target === imgContainer) {
                closeModal();
            }
        });
        modalImg.addEventListener('mousedown', (e) => {
            if (scale > 1) {
                isDragging = true;
                modalImg.style.cursor = 'grabbing';
                modalImg.style.transition = 'none';
                startX = e.clientX; startY = e.clientY; lastX = translateX; lastY = translateY;
                e.preventDefault();
            }
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            e.preventDefault();
            const deltaX = e.clientX - startX;
            const deltaY = e.clientY - startY;
            translateX = lastX + deltaX;
            translateY = lastY + deltaY;
            updateTransform();
        });

        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                modalImg.style.cursor = 'grab';
                modalImg.style.transition = 'transform 0.1s ease-out';
            }
        });
        modal.addEventListener('wheel', (e) => { e.preventDefault(); const delta = e.deltaY > 0 ? -0.1 : 0.1; scale = Math.min(Math.max(0.5, scale + delta), 5); updateTransform(); });
        document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });
    }
    function attachClickListener(img) {
        if (img.dataset.naiZoomAttached) {
            return;
        }
        img.addEventListener('click', handleImageClick);
        img.style.cursor = 'zoom-in';
        img.dataset.naiZoomAttached = 'true';
    }
    document.querySelectorAll('.image-grid-image').forEach(attachClickListener);
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.addedNodes) {
                for (let node of mutation.addedNodes) {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        if (node.classList && node.classList.contains('image-grid-image')) {
                            attachClickListener(node);
                        }
                        if (node.querySelectorAll) {
                            node.querySelectorAll('.image-grid-image').forEach(attachClickListener);
                        }
                    }
                }
            }
            if (mutation.type === 'attributes' && mutation.attributeName === 'src') {
                const targetNode = mutation.target;
                if (targetNode.classList && targetNode.classList.contains('image-grid-image')) {
                    attachClickListener(targetNode);
                }
            }
        });
    });
    observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['src']
    });
}
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", addImageZoomFeature);
} else {
    addImageZoomFeature();
}

    // Auto update functionality
    function compareVersions(v1, v2) {
        const a = v1.split('.').map(Number);
        const b = v2.split('.').map(Number);
        for (let i = 0; i < Math.max(a.length, b.length); i++) {
            const num1 = a[i] || 0;
            const num2 = b[i] || 0;
            if (num1 > num2) return 1;
            if (num1 < num2) return -1;
        }
        return 0;
    }

    setTimeout(async () => {
        try {
            const res = await fetch('https://raw.githubusercontent.com/mikojiy/naipm-test/main/NAIPM.user.js?t=' + Date.now(), { cache: 'no-cache' });
            const text = await res.text();
            const match = text.match(/@version\s+([0-9.]+)/);
            if (!match) return;
            const latestVersion = match[1];
            const currentVersion = "2.5"; // Updated version
            const comparison = compareVersions(latestVersion, currentVersion);
            if (comparison > 0 && !document.getElementById('nai-update-notice')) {
                const notice = document.createElement('div');
                notice.id = 'nai-update-notice';
                Object.assign(notice.style, {
                    position: 'fixed',
                    top: '30px',
                    right: '30px',
                    zIndex: '99999',
                    background: '#1e40af',
                    color: 'white',
                    padding: '16px 20px',
                    borderRadius: '12px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                    maxWidth: '380px',
                    fontFamily: 'sans-serif',
                    fontSize: '14px',
                    lineHeight: '1.5'
                });
                notice.innerHTML = `
                    <b>${t('updateAvailable')}</b><br>
                    ${t('updateNew')(latestVersion)}<br>
                    ${t('updateCurrent')}<br>
                    <button id="update-now" style="
                        margin-top: 10px;
                        padding: 8px 14px;
                        background: white;
                        color: #1e40af;
                        border: none;
                        border-radius: 8px;
                        font-weight: bold;
                        cursor: pointer;
                    ">${t('updateNow')}</button>
                `;
                document.body.appendChild(notice);
                document.getElementById('update-now').onclick = () => {
                    window.open('https://raw.githubusercontent.com/mikojiy/naipm-test/main/NAIPM.user.js', '_blank');
                    notice.remove();
                };
            }
        } catch (e) {
            console.warn('Auto update check failed:', e);
        }
    }, 3000);

})();
