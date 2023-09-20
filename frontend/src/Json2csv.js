import React from 'react'
import jsonToCsvExport from 'json-to-csv-export'

const ipAddressesData = [
    {
        "name": "jdjd",
        "createdAt": "2023-08-10T11:46:11.647Z",
        "updatedAt": "2023-08-12T11:20:14.990Z",
        "publishedAt": "2023-08-10T11:46:11.646Z",
        "sfd": null
    },
    {
        "name": "jn",
        "createdAt": "2023-08-10T11:46:18.483Z",
        "updatedAt": "2023-08-23T10:11:00.132Z",
        "publishedAt": "2023-08-10T11:46:18.481Z",
        "sfd": 34243
    },
    
]

const dataToConvert = {
  data: ipAddressesData,
  filename: 'ip_addresses_report',
  delimiter: ',',
  headers: ['name', "createdAt", "updatedAt", "publishedAt", "sfd"]
}

const Json2csv = () => {
  return (
    <button onClick={() => jsonToCsvExport(dataToConvert)}>
      Download Data
    </button>  )
}

export default Json2csv