## Sources of data and how to update

The [Comtrade API documentation](http://comtrade.un.org/data/doc/api/) links some configuration files to populate dropdown menus.
Additionally other info is available through other UN websites.
The list below is an overview of resources consumed by the visualization:

### reporterAreas.json

### partnerAreas.json

Contains the list of partner countries/areas in the following format suitable for select2:

```
{
  "more": false,
  "results": [
    {
        "id": "826",
        "text": "United Kingdom"
    },
    {...}
  ]
}
```

Found on this page: http://comtrade.un.org/data/doc/api/

Direct link: http://comtrade.un.org/data/cache/partnerAreas.json

### classificationHS.json

### Country Code and Name ISO2 ISO3.xls
This file contains the matching of the numerical id used by the UN and the three-letter ISO country code.
A csv file (countries.csv) is exported from this spreadsheet and used in the visualization.

Found on this page: http://unstats.un.org/unsd/tradekb/Knowledgebase/Comtrade-Country-Code-and-Name

Direct link: http://unstats.un.org/unsd/tradekb/Attachment321.aspx