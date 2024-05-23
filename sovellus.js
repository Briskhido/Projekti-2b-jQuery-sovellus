// Kun sivu on ladattu
$(document).ready(function() {
    // Haetaan teatterilista Finnkino API:sta
    $.get('https://www.finnkino.fi/xml/TheatreAreas/', function(data) {
        // Täytetään valintaelementti teatterilistalla
        $(data).find('TheatreArea').each(function() {
            const vaihtoehto = $('<option>').val($(this).find('ID').text()).text($(this).find('Name').text());
            $('#teatteriValinta').append(vaihtoehto);
        });
    });

    // Lisätään tapahtumakuuntelijat valinta- ja syöttöelementeille
    $('#teatteriValinta, #hakuSyote').on('change input', haeJaNaytaElokuvat);
});

function haeJaNaytaElokuvat() {
    // Haetaan elokuvatiedot Finnkino API:sta
    $.get(`https://www.finnkino.fi/xml/Schedule/?area=${$('#teatteriValinta').val()}&dt=${new Date().toISOString().split('T')[0]}`, function(data) {
        // Suodatetaan ja näytetään elokuvat hakusyötteen perusteella
        let elokuvaKartta = new Map();
        $(data).find('Show').each(function() {
            const otsikko = $(this).find('Title').text();
            const kuvaUrl = $(this).find('EventLargeImagePortrait').text();
            let naytosaika = new Date($(this).find('dttmShowStart').text());
            naytosaika = naytosaika.getHours() + ':' + ('0' + naytosaika.getMinutes()).slice(-2); // Muotoillaan kellonaika ilman sekunteja
            if (otsikko.toLowerCase().includes($('#hakuSyote').val().toLowerCase())) {
                if (!elokuvaKartta.has(otsikko)) {
                    elokuvaKartta.set(otsikko, {kuvaUrl: kuvaUrl, naytosajat: [naytosaika]});
                } else {
                    elokuvaKartta.get(otsikko).naytosajat.push(naytosaika);
                }
            }
        });
        // Muunnetaan Map taulukoksi ja järjestetään se
        let elokuvaTaulukko = Array.from(elokuvaKartta.entries());
        elokuvaTaulukko.sort((a, b) => a[0].localeCompare(b[0]));
        $('#elokuvaTiedot').empty();
        elokuvaTaulukko.forEach(([avain, arvo]) => {
            const div = $('<div>').addClass('col-md-4 mb-3').hide().fadeIn(1000);
            const card = $('<div>').addClass('card');
            const img = $('<img>').addClass('card-img-top').attr('src', arvo.kuvaUrl);
            const cardBody = $('<div>').addClass('card-body');
            const h5 = $('<h5>').addClass('card-title').text(avain);
            const ul = $('<ul>').addClass('list-group list-group-flush');
            arvo.naytosajat.forEach(naytosaika => {
                const li = $('<li>').addClass('list-group-item').text(naytosaika);
                ul.append(li);
            });
            cardBody.append(h5);
            card.append(img, cardBody, ul);
            div.append(card);
            $('#elokuvaTiedot').append(div);
        });
    });
}
