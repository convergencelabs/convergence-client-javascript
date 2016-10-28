import {PresenceService} from "./PresenceService";

import Rx from "rxjs/Rx";

const service: PresenceService = null;

service.presence("jim").then(presence => {
  console.log(presence.isAvailable());
  console.log(presence.state("away_message"));
});

service.presence(["jim", "bob"]).then(presences => {
  presences.forEach(presence => {
    console.log(presence.isAvailable());
    console.log(presence.state("away_message"));
  });
});


service.subscribe("jim").then(presence => {
  presence.on("available", (e) => {
    console.log("availability changed for jim");
  });

  // ..

  presence.unsubscribe();
  // no more events;
});

service.subscribe(["jim", "bob"]).then(pres => {
  // now we have a list. I might want to add another person.

  service.subscribe("alice").then(alicePres => {
    pres.push(alicePres);
  });
});

// Observables
service.subscribe("jim").then(pres => {
  pres.asObservable().subscribe(presence => {
    console.log("Presence changed for: " + presence.username());
  });

  // this would complete the observable above.
  pres.unsubscribe();
});


// Lets say I want to observe the whole group.
service.subscribe(["jim", "bob"]).then(pres => {
  Rx.Observable.merge(pres.map(p => p.asObservable())).subscribe(presence => {
    console.log("Presence changed for: " + presence.username());
  });

  // later.. again would complete the above merged observable.
  pres.forEach(p => p.unsubscribe());
});
