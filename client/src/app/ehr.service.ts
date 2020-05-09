import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class EhrService {
  httpOptions1 = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Basic ${btoa('lio.se1:lio.se123')}`,
    }),
  };

  httpOptions2 = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Basic ${btoa('lio.se2:ehr4lio.se2')}`,
    }),

  };

  baseUrl = 'https://rest.ehrscape.com/rest/v1';

  urlCreateId = 'https://rest.ehrscape.com/rest/v1/ehr';

  urlPartyData = `${this.baseUrl}/demographics/party`;

  urlpnr = '/demographics/party/query/?Personnummer=';

  urlPnr = this.baseUrl + this.urlpnr;

  urlActive = `${this.baseUrl}/demographics/party/query/?Active=True`;


  constructor(private http: HttpClient) { }

  /* Hämtar party-data från givet personnumemer, bör endast hämta ett party */
  getPnr(pnr: string) {
    const url = this.urlPnr + pnr;
    return this.http.get(url, this.httpOptions1);
  }

  /* Postar party data för en person, kommer innehålla bl.a. ehrid, pnr och namn, dummydata */
  postPartyData(name, ehr, personnummer) {
    const ehrid = ehr.ehrId;
    return this.http.post(this.urlPartyData,
      {
        firstNames: name,
        lastNames: name,
        dateOfBirth: '1962-10-02',
        gender: 'FEMALE',
        // id: 123456,
        partyAdditionalInfo: [
          {
            key: 'Personnummer',
            value: personnummer,
          },
          {
            key: 'Projekt',
            value: 'VERA2020',
          },
          {
            key: 'Sökorsak',
            value: 'Förmaksflicker',
          },
          {
            key: 'Ankomst',
            value: '12:00-4/5',
          },
          {
            key: 'Ålder',
            value: '44',
          },
          {
            key: 'ehrId',
            value: ehrid,
          },
          {
            key: 'Active',
            value: 'true',
          },
          {
            key: 'Ankomstsätt',
            value: 'ambulans',
          },
          {
            key: 'Team',
            value: 'B',
          },
          {
            key: 'Ansvläk',
            value: 'Test läk',
          },
          {
            key: 'Ansvssk',
            value: 'Test ssk',
          },
          {
            key: 'Ansvusk',
            value: 'Test usk',
          },
          {
            key: 'prio',
            value: 'red',
          },
        ],

      }, this.httpOptions2);
  }

  /* Skapar ett ehrID om det saknas för givet personnummer, annars hämtar den party datan för det personnummret
  * Egentligen ska det skickas med partydata som input för att fylla på om det inte finns ett ehrid */
  async createPerson(name, personnummer) {
    this.getPnr(personnummer.toString()).subscribe((resp: any) => {
      if (resp === null) {
        console.log('Skapa nytt ehrId och lägg till party data');
        const ehr = this.http.post(this.urlCreateId, '', this.httpOptions2);
        ehr.subscribe((resp2) => {
          this.postPartyData(name, resp2, personnummer).subscribe((ans1) => {
            console.log(ans1);
          });
        });
      } else {
        console.log('Hämta befintlig party data');
        console.log(resp.parties[0]); // Antag att en träff per personnummer
        return resp.parties[0];
      }
    });
  }

  /* Hämta alla aktiva patienter från EHRscape */
  getActivePatients(location: string) {
    return this.http.get(this.urlActive, this.httpOptions1);
  }
}
