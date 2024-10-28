document.addEventListener('DOMContentLoaded', function() {
    const addButton = document.getElementById('addButton');
    const videoIdInput = document.getElementById('videoId');
    const idList = document.getElementById('id-list');
    const errorMessage = document.getElementById('error-message');

    function loadVideoIds() {
        chrome.storage.sync.get('randomVideoIds', function(data) {
            const ids = data.randomVideoIds || [];
            updateIdList(ids);
        });
    }

    function updateIdList(ids) {
        idList.innerHTML = '';
        ids.forEach(function(id) {
            const div = document.createElement('div');
            div.className = 'id-item';
            div.textContent = id;
            
            const removeButton = document.createElement('button');
            removeButton.textContent = 'הסר';
            removeButton.className = 'remove-btn';
            removeButton.onclick = function() {
                removeVideoId(id);
            };
            
            div.appendChild(removeButton);
            idList.appendChild(div);
        });
    }

    function validateVideoId(id) {
        return /^[a-zA-Z0-9_-]{11}$/.test(id);
    }

    function addVideoId(id) {
        chrome.storage.sync.get('randomVideoIds', function(data) {
            const ids = data.randomVideoIds || [];
            if (!ids.includes(id)) {
                ids.push(id);
                chrome.storage.sync.set({randomVideoIds: ids}, function() {
                    updateIdList(ids);
                    videoIdInput.value = '';
                    errorMessage.textContent = '';
                });
            } else {
                errorMessage.textContent = 'מזהה זה כבר קיים ברשימה.';
            }
        });
    }

    function removeVideoId(id) {
        chrome.storage.sync.get('randomVideoIds', function(data) {
            const ids = data.randomVideoIds || [];
            const updatedIds = ids.filter(existingId => existingId !== id);
            chrome.storage.sync.set({randomVideoIds: updatedIds}, function() {
                updateIdList(updatedIds);
            });
        });
    }

    addButton.addEventListener('click', function() {
        const newId = videoIdInput.value.trim();
        if (validateVideoId(newId)) {
            addVideoId(newId);
        } else {
            errorMessage.textContent = 'ID לא תקין, אנא הכנס מזהה תקין .';
        }
    });

    loadVideoIds();
});