/**
 * Functions to handle the 'Conversation' modal.
 */

function messageDriver (target) {
  var deviceId = target
  if (deviceId instanceof HTMLLIElement) deviceId = target.id
  if (deviceId != null) {
    var sendMessageModal = new bootstrap.Modal(
      document.getElementById('sendMessageModal'),
      {}
    )
    document.getElementById('sendMessageModalDeviceId').innerHTML = deviceId;
    document.getElementById('sendMessageModalTitle').innerHTML =
      'Sending Message to ' +
      themedDeliveryPerson[theme] +
      ': ' +
      vehicles[deviceId].driverName

    var selectQuestions = document.getElementById('sendMessageModalMessage')
    selectQuestions.innerHTML = ''
    //  Populate questions based on current theme
    var option = document.createElement('option')
    option.value = "Select Message to Send";
    option.innerHTML = "Select Message to Send";
    selectQuestions.appendChild(option)
    for (question in themedQuestions[theme]) {
      var option = document.createElement('option')
      option.value = themedQuestions[theme][question]
      option.innerHTML = themedQuestions[theme][question]
      selectQuestions.appendChild(option)
    }

    sendMessageModal.show()
  }
}

function sendMessageModalSend () {
  var deviceId = document.getElementById('sendMessageModalDeviceId').innerHTML;
  var selectQuestions = document.getElementById('sendMessageModalMessage')
  if (selectQuestions.selectedIndex == 0) {
    //  User did not select question
    return
  }
  pubnub.publish({
    channel: vehicles[deviceId].channelName,
    message: {
      "question": themedQuestions[theme][selectQuestions.selectedIndex - 1],
      "questionId": (selectQuestions.selectedIndex - 1),
      "theme": theme
    }
  })
}
