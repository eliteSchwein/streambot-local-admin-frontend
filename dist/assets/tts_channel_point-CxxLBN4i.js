var e=`tasks:
  - channel: animation
    method: play
    data:
      target: generic_alert_animation
      startFrame: 363
      stopFrame: 477
      frameRate: 60
  - channel: function
    method: sleep
    data:
      time: 1900
`,t=`tasks:
  - channel: animation
    method: play
    data:
      target: raid_animation
      startFrame: 462
      stopFrame: 570
      frameRate: 60
  - channel: function
    method: sleep
    data:
      time: 1800
`,n=`tasks:
  - channel: animation
    method: play
    data:
      target: generic_alert_animation
      startFrame: 228
      stopFrame: 327
      frameRate: 60
      loop: true
`,r=`tasks:
  - channel: animation
    method: play
    data:
      target: raid_animation
      startFrame: 207
      stopFrame: 430
      frameRate: 60
      loop: true
`,i=`tasks:
  - channel: condition
    method: if
    check: '''\${data.url}'' === '''''
  - channel: function
    method: send_message
    data:
      content: Bitte eine YouTube oder Deezer URL angeben.
  - channel: condition
    method: end_macro
  - channel: condition
    method: end_if
  - channel: condition
    method: if
    check: '''\${songrequest.enabled}'' !== ''true'''
  - channel: function
    method: send_message
    data:
      content: Songrequests sind aktuell deaktiviert.
  - channel: condition
    method: end_macro
  - channel: condition
    method: end_if
  - channel: condition
    method: if
    check: '''\${songrequest.query_blocked}'' === ''true'''
  - channel: function
    method: send_message
    data:
      content: Dieser Songrequest ist blockiert.
  - channel: condition
    method: end_macro
  - channel: condition
    method: end_if
  - channel: condition
    method: if
    check: '''\${songrequest.query_already_present}'' === ''true'''
  - channel: function
    method: send_message
    data:
      content: Dieser Songrequest ist bereits in der Queue.
  - channel: condition
    method: end_macro
  - channel: condition
    method: end_if
  - channel: function
    method: song_request
    data:
      url: \${data.url}
  - channel: function
    method: send_message
    data:
      content: Songrequest wurde hinzugefügt.
`,a=`tasks:
  - channel: function
    method: song_request_toggle
    data: {}
  - channel: function
    method: send_message
    data:
      content: 'Songrequests: \${songrequest.enabled}'
`,o=`tasks:
  - channel: animation
    method: play
    data:
      target: generic_alert_animation
      startFrame: 0
      stopFrame: 191
      frameRate: 60
  - channel: function
    method: sleep
    data:
      time: 3200
`,s=`tasks:
  - channel: animation
    method: play
    data:
      target: raid_animation
      startFrame: 0
      stopFrame: 207
      frameRate: 60
  - channel: function
    method: sleep
    data:
      time: 3500
`,c=`tasks:
  - channel: condition
    method: if
    check: '''\${data.text}'' === '''''
  - channel: function
    method: send_message
    data:
      content: Du musst einen Text angeben!
  - channel: condition
    method: end_macro
  - channel: condition
    method: end_if
  - channel: dummy_alert
    message: \${context.userName} sagt \${data.text}
    duration: tts
    icon: ''
    speak: true
    event_uuid: \${eventUuid}
`,l=`tasks:
  - channel: dummy_alert
    message: \${channelPoint.userName} sagt \${channelPoint.input}
    speak: true
  - channel: channel_point
    method: accept
`;export{a,n as c,o as i,t as l,c as n,i as o,s as r,r as s,l as t,e as u};