## DriverLog

Application used to record points to fairly (or unfairly) determine who will drive next.

### Implementation
- People names have to be listed in the select dropdown in index.html
- The DB uses a few CouchDB "views" (map/reduce):
  - Map to emit all points/driver by record, reduce to sum the points per driver
  - Map to emit all drives by their date in descending order to show for the history views

### TODO
- Move names into database

#### Tech/API's
- jQuery
- Mustache.js
- CouchApp
- Forecast.io weather API
- Bootstrap
