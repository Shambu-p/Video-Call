function createNewParticipant(user_id) {

    let element = document.getElementById("participant_grid");
    element.innerHTML += `
    <div class="col-sm-12 col-md-6 col-lg-4 p-3 rounded-2 mb-2 bg-dark" id="${user_id}_container">
        <video src="" class="participant_video" id="${user_id}"></video>
        <div class="w-100 bg-dark d-flex justify-content-between py-2">
            <h5 class="card-title text-white">${user_id}</h5>
            <button class="btn btn-sm btn-light">Focus</button>
        </div>
    </div>
    `;

}