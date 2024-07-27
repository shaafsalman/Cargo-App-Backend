
const logoEmbeded = require('./logoEmbeded');

export const generateAirWaybillHTML = (booking) => {
  const {
      awb,
      consigneeName,
      consigneeEmail,
      consigneePhone,
      consigneeAddress,
      consigneeCity,
      consigneeCountry,

      shipperName,
      shipperEmail,
      shipperPhone,
      shipperAddress,
      shipperCity,
      shipperCountry,
      packages,
      totalInputWeight,
      totalVolumetricWeight,
      rate,
      status,
      dangerousGoodsCodes,
      goodsDescriptionsCodes,
      specialHandlingCodes,
      fromRegion,
      toRegion,
      createdBy,
      createdDate,
      cargoRate,
      
    } = booking;
    
const packageCount = packages.length;
const total=(totalInputWeight+totalVolumetricWeight)*packageCount;
const imagePath = 'https://i.ibb.co/vc2rV3V/Daallo-Logo1.png'; 

let currency='';
for(let i=0;i<3;i++){
    currency+=rate[i];
}
let to='';
let from='';
if(toRegion==='Bossaso'){
  to='BSA';
  from='BSA';
}
else if(toRegion==='Dubai'){
  to='DXB';
  from='DXB';
}
else if(toRegion==='Garowe'){
  to='GGR';
  from='GGR';
}
else if(toRegion==='Hargeisa'){
  to='HGA';
  from='HGA';
}
else if(toRegion==='Jeddah'){
  to='JED';
  from='JED';
}
else if(toRegion==='Djibouti'){
  to='JIB';
  from='JIB';
}
else if(toRegion==='Madinah'){
  to='MED';
  from='MED';
}
else if(toRegion==='Mogadishu'){
  to='MGQ';
  from='MGQ';
}
else if(toRegion==='Nairobi'){
  to='NBO';
  from='SHJ';
}
else if(toRegion==='Sharjah'){
  to='SHJ';
  from='SHJ';
}
let start='';
let end='';
for(let i=0;i<=2;i++){
  start+=awb[i];
}
for(let i=3;i<awb.length;i++){
  end+=awb[i];
}

let finalStr=start+" | "+to+" | "+end;


return `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Document</title>
<style>



*{
box-sizing:border-box;
/* margin:0; */
/* padding:0; */
font-size:8px;
font-family:arial;
}
#main-heading{
color:red;
}
#main{
border-bottom:0;
/* height:1200px; */
}
#heading-below{
/* border:2px solid rgb(204,204,204); */
width:100%;
display:flex;
alig-items:center;
justify-content:space-between;
}
#box1{
height:150px;
width:50%;
 padding:2px; 
position:relative;
border-right:0;
}
#shipper-flyer{
border:1px solid rgb(204,204,204);
position:absolute;
top:0px;
width:45%;
right:0px;
height:15px;
display:flex;
align-items:center;
justify-content:center;
padding-left:5px;
border-top:0;
border-right:0;
}
#box2{
padding:2px; 
height:70px;
border:1px solid rgb(204,204,204);
width:100%;
/* padding-left:10px; */
position:relative;
border-bottom:0;
border-left:0;
}
#consignee-flyer{
border:1px solid rgb(204,204,204);
position:absolute;
top:0px;
width:45%;
right:0px;
height:20px;
display:flex;
align-items:center;
justify-content:center;
padding:5px;
border-top:0;
border-right:0;

}
#box3{
border:1px solid rgb(204,204,204);
width:100%;
border-left:0;
padding-left:2px;
/* border-right:0; */
}
#box4{
width:100%;
height:20px;
display:flex;
border-top:0;
border-left:0;
}
#box4-1{
 padding-left:2px; 
width:60%;
border:1px solid rgb(204,204,204);
height:100%;
/* display:inline-flex; */
border-right:0;
border-top:0;
border-left:0;

}
#box4-2{
padding-left:2px; 
width:40%;
border:1px solid rgb(204,204,204);
height:100%;
/* display:inline-flex; */
border-top:0;
/* border-right:0; */

}
#box6{
width:50%;
height:90px;
display:flex;
/* border:2px solid rgb(204,204,204); */
}
#box3-1{
/* padding-left:10px; */
width:11%;
border:1px solid rgb(204,204,204);
/* display: inline-block; */
border-right:none;
/* transform: translateY(-4px); */
}
#box6-2{
/* display:inline-block; */
border:1px solid rgb(204,204,204);
width:40%;
height:100%;
padding-left:10px;

/* transform: translateY(-2px); */
}
#tilted{
display: inline-block;
/* border:2px solid orange; */
border-top:0;
margin-left:15px;
border:1px solid rgb(204,204,204);
border-top:0;
margin-top:3px;
margin-right:10px;
padding:2px;
}
#temp1{
height:2px;
width:10%;
border:1px solid rgb(204,204,204);
margin-left:15px;
transform:translateX(75px) translateY(-30px) rotate(65deg);
}
#temp2{
height:2px;
width:10%;
border:1px solid rgb(204,204,204);
margin-left:15px;
transform:translateX(234px) translateY(-32px) rotate(-65deg);
}
#box6-3{
/* display: inline-block; */
border:1px solid rgb(204,204,204);
width:20%;
height:100%;
margin:0;
padding-left:10px;
border-left:0;
/* border-top:0; */
border-right:0;
/* transform:translateY(-6px) translateX(-4px); */
}
#box6-4{
border: 1px solid rgb(204,204,204);
/* display:inline-block; */
height:100%;
width:10%;
border-right:0;

/* transform:translateY(-55px) translateX(-8px); */
}
#box6-5{
border: 1px solid rgb(204,204,204);
/* display:inline-block; */
width:10%;
border-right:0;
height:100%;
/* transform:translateY(-55px) translateX(-12px); */
}
#box6-6{
border: 1px solid rgb(204,204,204);
/* display:inline-block; */
width:9%;
height:100%;
/* transform:translateY(-55px) translateX(-16px); */

}
#box7{
width:50%;
height:120px;
border:1px solid rgb(204,204,204);
display:flex;
padding-left:10px;
}
#box7-1{
width:20%;
height:100%;
border-right:2px solid yellow;
}
#box7-2{
display:flex;
justify-content:center;
width:50%;
height:100%;
align-items:flex-start;
border-right:1px solid rgb(204,204,204);
}
#cont{
border:1px solid rgb(204,204,204);
/* height:20%; */
margin:15px;
margin-top:5px;
border-top:0;
padding:2px;  
}
#box8{
width:100%;
border:1px solid rgb(204,204,204);
height:80px;
}
#box9{
display:flex;
border:1px solid rgb(204,204,204);
width:100%;
height:75px;
}
#box9-1{
width:10%;
border:1px solid rgb(204,204,204);
padding-left:5px;
border-top:0;
border-right:0;
}
#box9-2{
width:10%;
border:1px solid rgb(204,204,204);
padding-left:5px;
border-top:0;
border-right:0;
}
#box9-3{
width:5%;
border:1px solid rgb(204,204,204);
padding-left:5px;
border-top:0;
border-right:7px solid rgb(204,204,204);

}
#box9-4{
width:10%;
padding-left:5px;
border:1px solid rgb(204,204,204);
border-top:0;
border-right:7px solid rgb(204,204,204);

}
#box9-4-1{
border-bottom:1px solid rgb(204,204,204);
}
#box9-5{
border:1px solid rgb(204,204,204);
width:10%;
padding-left:5px;
border-top:0;
border-right:7px solid rgb(204,204,204);
}
#box9-6{
border:1px solid rgb(204,204,204);
width:10%;
padding-left:5px;
border-top:0;
border-right:7px solid rgb(204,204,204);
}
#box9-7{
border:1px solid rgb(204,204,204);
width:10%;
padding-left:5px;
border-top:0;
border-right:7px solid rgb(204,204,204);
}
#box9-8{
border:1px solid rgb(204,204,204);
width:45%;
padding-left:10px;
border-border:0;
border-top:0;
}

#box10{
display:flex;
border:1px solid rgb(204,204,204);
width:100%;
height:75px;
}
#box10-1{
width:10%;
border:1px solid rgb(204,204,204);
padding-left:5px;
border-top:0;
}
#box10-2{
width:10%;
border:1px solid rgb(204,204,204);
padding-left:5px;
border-top:0;
border-left:0;
border-right:0;
}
#box10-3{
width:5%;
border:1px solid rgb(204,204,204);
padding-left:5px;
border-top:0;
border-right:0;
}
#box10-4{
width:10%;
padding-left:5px;
border:1px solid rgb(204,204,204);
border-top:0;
border-right:0;
}
#box10-4-1{
border-bottom:1px solid rgb(204,204,204);
}
#box10-5{
border:1px solid rgb(204,204,204);
width:10%;
padding-left:5px;
border-top:0;
border-right:0;
}
#box10-6{
border:1px solid rgb(204,204,204);
width:10%;
padding-left:5px;
border-top:0;
border-right:0;
}
#box10-7{
border:1px solid rgb(204,204,204);
width:10%;
padding-left:5px;
border-top:0;
border-right:0;
}
#box10-8{
border:1px solid rgb(204,204,204);
width:45%;
padding-left:10px;
border-border:0;
border-top:0;
border-right:0;
}
#b10-1-1{
border-top:1px solid rgb(204,204,204);
width:100%;
display:flex;
justify-content:flex-end;
padding-right:5px;
}
#b10-2-1{
border-top:1px solid rgb(204,204,204);
width:100%;
display:flex;
justify-content:flex-end;
padding-right:5px;
}
#box11{
height:150px;
border:2px solid rgb(204,204,204);
}
#box11-1{
width:50%;
display:flex;
justify-content:space-around;
height:35px;
/* border:2px solid red; */
border-right:1px solid rgb(204,204,204);
}
#prepaid{
border:1px solid rgb(204,204,204);
padding:10px;
border-top:0;
margin-top:5px;
heading:100%;
}
#weight{
border:1px solid rgb(204,204,204);
padding:10px;
border-top:0;
margin-top:5px;
heading:100%;

}
#collect{
border:1px solid rgb(204,204,204);
padding:10px;
border-top:0;
margin-top:5px;
heading:100%;

}
#box11-2{
width:50%;
/* border:2px solid rgb(204,204,204); */
height:25px;
border-right:1px solid rgb(204,204,204)
}
#line{
margin-left:50%;
border:1px solid rgb(204,204,204);
width:2px;
height:25px;
}
#box11-3{
width:50%;
border:1px solid rgb(204,204,204);
height:50px;
border-bottom:0;
border-left:0;
}
#valuation{
border:1px solid rgb(204,204,204);
padding:10px;
border-top:0;
margin-top:5px;
margin-left:42%; 
width:20%;   
height:40%;
display:flex;
align-items:center;
justify-content:center;
}
#line2{
margin-left:50%;
border:1px solid rgb(204,204,204);
width:2px;
height:20px;
}
#row1{
display:flex;
width:100%;
height:100px;
 border:1px solid rgb(204,204,204); 
 border-bottom:0;
}
#r1b2{
padding-top:5px;
border:1px solid rgb(204,204,204);
width:50%;
padding-left:10px;
height:100%;
border-right:0;
border-top:0;
}
img{
    /* border:2px solid rgb(204,204,204); */
    height: 30%;
}
#row2{
display:flex;
width:100%;
height:150px;
border-left:1px solid rgb(204,204,204);
}
#row5{
height:50px;
padding-left:2px;
/* border:2px solid orange; */
}
#row2-1{
width:50%;
height:100%;

/* border:2px solid red; */
}
#row3{
width:100%;
/* border:2px solid red; */
height:65px;
display:flex;
border-bottom:0;
}
#row3-1{
width:50%;
display:flex;
border-bottom:0;
}
#row4{
width:100%;
display:flex;
height:55px;
border:1px solid rgb(204,204,204);
border-top:0;

}
#r4b1{
height:100%;
border:1px solid rgb(204,204,204);
width:50%;
border-top:0;
border-left:0;
border-bottom:0;
padding-left:2px;
padding-top:5px;
}
#box5{
width:100%;
height:45px;
padding-left:2px;
/* background-color:red; */
/* border:2px solid rgb(204,204,204); */
border-top:0;
border-left:0;
border-right:1px solid rgb(204,204,204);
}
#row5{
width:100%;
height:20px;
border:1px solid rgb(204,204,204);
border-top:0;
}
#row6{
display:flex;
height:45px;
border-bottom:0;
border-top:0;
}
#row7{
display:flex;
height:45px;
border-bottom:0;
border-top:0;
border-right:1px solid rgb(204,204,204);
}
#row8{
/* display:flex; */
height:111px;
border-bottom:1px solid rgb(204,204,204);
border-left:1px solid rgb(204,204,204);
border-right:1px solid rgb(204,204,204);
border-bottom:0;
border-top:0;
/* border:2px solid orange; */
}
#row9{
width:100%;
height:40px;
border-bottom:1px solid rgb(204,204,204);
border-bottom:0;
border-right:1px solid rgb(204,204,204);
}
#row9-1{
width:50%;
height:100%;
border:1px solid rgb(204,204,204);
border-bottom:0;
}
#tax{
margin-left:35%;
border:1px solid rgb(204,204,204);
width:30%;
display:flex;
justify-content:center;
border-top:0;
margin-top:5px;
}
#taxline{
border:1px solid rgb(204,204,204);
height:22px;
width:1px;
margin-left:50%;
}
#row10{
/* height:110px; */
/* border-bottom:1px solid rgb(204,204,204); */
/* border:2px solid orange; */
display:flex;
}
#row10-1{
width:50%;
border-bottom:0;
border-top:0;
border-border:0;
}
#r10-1-1{
width:100%;
height:60px;
border-top:0;
border:1px solid rgb(204,204,204);
border-bottom:0;

}
#totalcharges{
margin-left:35%;
border:1px solid rgb(204,204,204);
width:30%;
display:flex;
justify-content:center;
border-top:0;
margin-top:5px;
padding:3px;
}
#totalchargesline{
border:1px solid rgb(204,204,204);
height:16px;
width:1px;
margin-left:50%;
}
#r10-1-3{
width:100%;
height:30px;
border-top:0;
border:1px solid rgb(204,204,204);
/* border-bottom:0; */
}
#temp01{
width:50%;
border:1px solid rgb(204,204,204);
height:100%;
border-bottom:0;
border-top:0;
border-left:0;
}
#row11{
 height:179px; 
border-bottom:1px solid rgb(204,204,204);
width:100%;
border-right:0;
border-left:0;
display:flex;
}
#row11-1{
width:50%;
/* border:2px solid red; */
/* height:100%; */
border-right:0;
border-left:0;
border-top:0;
}
#r11-1-1{
height:40px;
display:flex;
width:100%;
border:1px solid rgb(204,204,204);
border-bottom:0;
border-top:0;
border-right:0;
}
#r11-1-2{
height:33%;
display:flex;
width:100%;
border:1px solid rgb(204,204,204);
border-bottom:0;
height:60px;
border-right:0;
}
#r11-1-3{
height:75px;
display:flex;
width:100%;
border:1px solid rgb(204,204,204);
/* border-bottom:0; */
border-right:0;
border-bottom:0;
}
#temp03{
width:50%;
border:1px solid rgb(204,204,204);
height:100%;
border-bottom:0;
border-top:0;
border-left:0;
display:flex;
align-items:center;
justify-content:center;
/* border:2px solid rgb(204,204,204); */
}
#temp04{
width:50%;
border:1px solid rgb(204,204,204);
height:100%;
border-bottom:0;
border-top:0;
border-left:0;
}
#tprepaid{
margin-left:15%;
border:1px solid rgb(204,204,204);
width:70%;
display:flex;
justify-content:center;
border-top:0;
margin-top:5px;
padding:3px;
}
#tcollect{
margin-left:15%;
border:1px solid rgb(204,204,204);
width:70%;
display:flex;
justify-content:center;
border-top:0;
margin-top:5px;
padding:3px;
}
#r2-2{
width:50%;
heading:100%;
padding-left:2px;
border-bottom:1px solid rgb(204,204,204);
border-right:1px solid rgb(204,204,204);

}
#row3-2{
display:flex;
width:50%;
height:100%;
border-bottom:1px solid rgb(204,204,204);
border-right:1px solid rgb(204,204,204);

}
#r3-2-1{
height:100%;
width:12%;
border-right:1px solid rgb(204,204,204);
}
#r3-2-2{
height:100%;
width:8%;
border-right:1px solid rgb(204,204,204);
}
#r3-2-3{
height:100%;
width:15%;
border-right:1px solid rgb(204,204,204);
}
#r3-2-4{
height:100%;
width:25%;
border-right:1px solid rgb(204,204,204);
display:flex;
justify-content:center;
align-items:center;
}
#r3-2-5{
height:100%;
width:25%;
/* border-right:2px solid rgb(204,204,204); */
display:flex;
justify-content:center;
align-items:center;
}
#r4s1{
width:50%;
display:flex;
/* height:200px; */
/* border:2px solid red; */
}
#r4s2{
width:50%;
padding:3px;
display:flex;
border-right:0;
justify-content:space-around;
/* height:200px; */
/* border:2px solid red; */
}
#ll{
height:100%;
width:0.1px;
border:0.1px solid rgb(204,204,204);
}
#row10-2{
width:50%;
border-top:1px solid rgb(204,204,204);
border-bottom:1px solid rgb(204,204,204);
border-right:1px solid rgb(204,204,204);

}
.dotted-hr {
border: none;
border-top: 1px dotted rgb(204,204,204);
color: #000;
background-color: #fff;
height: 1px;
}
#row11-2{
width:50%;
border-right:1px solid rgb(204,204,204);
}
.fullhr{
height:13px;
}
#last{
width:40%;
border-right:1px solid rgb(204,204,204);
height:50%;
}
#value{
border:1px solid rgb(204,204,204);
border-top:0;
margin-top:0;
width:70%;
margin-left:20%;
display:flex;
justify-content:center;
}

.logo {
    display: flex;
}

/* Style the img within the logo */
.logo img {
    max-width: 60%; /* Make the image responsive */
    height: auto; /* Maintain aspect ratio */
}

.logo h1{
font-size:23px;
font-weight:bolder;
display:flex;
align-items:center;
font-family: Verdana;
}
</style>
</head>
<body>

<div id="heading-below">
    <p>${finalStr}</p>
    <p>ORIGINAL</p>
    <p>AirwayBill # 991-10009624</p>
</div>
<div id="main">
    <div id="row1">
        <div id="box1">
            Shipper's Name,Address<br>
            ${shipperName}<br>
            ${shipperAddress},${shipperCity},${shipperCountry}<br>
            Tel: ${shipperPhone} <br>
            <div id="shipper-flyer">
                Shipper's Account Number
            </div>
        </div>
        <div id="r1b2">
            Not negotiable<br>
            Air Waybill<br>
            <div class="logo"><h1 style="color:#3b986e;"><img src="${logoEmbeded}" alt="Daallo Airlines Logo"></h1></div>
            Issued By <br>
        </div>
    </div>
    <div id="row2">
        <div id="row2-1">
            <div id="box2">
                Consignee's Name,Address<br>
                ${consigneeName}<br>
                ${consigneeAddress},${consigneeCity},${consigneeCountry}<br>
                Tel: ${consigneePhone} <br>
                <div id="consignee-flyer">
                    <p>Consignee's Account Number</p>
                </div>
                </div>
                <div id="box3">
                    Issuing Carrier's Agent's Name & City<br>
                    Daallo Airlines
                </div>
                <div id="box4">
                    <div id="box4-1">Agent's IATA Code</div>
                    <div id="box4-2">Account No.</div>
                </div>
                <div id="box5">
                    Airport of Departure(Addr. of first Carrier) and requested Routing<br>
                    ${fromRegion}
                </div>
        </div>
        <div id="r2-2">
        <p style="font-size:7px; padding-left:3px;">
        It is agreed that goods described here are apparent good order and condition (except as noted) for carriege SUBJECT TO THE CONDITIONS OF CONTRACT ON THE REVERSE HEREOF. THE SHIPPER'S ATTENTION IS DRAWN TO THE NOTICE CONCERNING CARRIERS LIMITATION OF LIABILITY. Shipper may increase such indication of liability by declaring ahigher value for carriege and paying a supplemental charge if required. ALL GOODS MAY BE CARRIED BY ANY OTHER MEANS INCLUDING ROAD OR ANY OTHER CARRIER UNLESS SPECIFIC CONTRARY INSTRUCTIONS ARE GIVEN HEREON BY THE SHIPPER, AND SHIPPER AGREES THAT THE SHIPMENT MAY BE CARRIED VIA INTERMEDIATE STOPPING PLACES WHICH THE CARRIER DEEMS APPROPRIATE.
        </p>
            <hr>
            Accounting Information <br>
         COLLECT PAYMENT AT DESTINATION <br>
         CONSIGNEE NON ACCOUNT
         <br>
         SECURITY ID:0 | PRIORITY:4
        </div>
        
        </div>
        <!-- <div id="row2-2">hel</div> -->
    </div>
    <div id="row3">
    <div id="row3-1">
        <div id="box3-1">
            to<br>
            ${to}
        </div>
        <div id="box6-2">
            By first carrier
            <div id="tilted"> Routing & Destination</div>
            D3
        </div>
        <div id="box6-3">
            to<br>
            NBO D3
        </div>
        <div id="box6-4">by</div>
        <div id="box6-5">to</div>
        <div id="box6-6">by</div>
    </div>
    <div id="row3-2">
         <div id="r3-2-1">
            Currency <br><br><br>
            ${currency}
         </div>
         <div id="r3-2-2">
            Chgs Code CC
         </div>
         <div id="r3-2-3">
            WT VAL
            <hr>
            PPD | COLL XX
         </div>
         <div id="r3-2-3">
            Other
            <hr>
            PPD | COLL XX
         </div>
         <div id="r3-2-4">
            Declared value for <br> Carriage NDV
         </div>
         <div id="r3-2-5">
            Declared value for <br> Customers NVC
         </div>
    </div>
</div>
<div id="row4">
        <div id="r4s1">
            <div id="r4b1">
                Airport of Destination<br>
                ${toRegion}
            </div>
            <div id="box7-2">
                <p>Flight/Date</p>
                <p id="cont">For Carrier Use Only
                </p>
                <p>Flight/Date</p>
            </div>
        </div>
        <div id="r4s2">
            Amount of Insurance
            <div id="ll"></div>
            <p style="padding-left:2px;">
            INSURANCE - If carrier offers insurance and such Insurance is requested in Destination
            accordance with conditions on reverse hereof indicate amount to be insured in figure in box marked Amount of Insurance
            </p>
        </div>
</div>
    <div id="row5">
        Handling Information: General Cargo Routing: DXB-MGQ-NBO
    </div>
    <div id="row6">
        <div id="box9-1">No of Pieces RCP</div>
        <div id="box9-2">Gross Weight</div>
        <div id="box9-3">KG LB</div>
        <div id="box9-4">
            <div id="box9-4-1">Rate class</div>
            <div id="box9-4-2">Commodity Item No.</div>
        </div>
        <div id="box9-5">Chargeable Weight</div>
        <div id="box9-6">Rate/Charge</div>
        <div id="box9-7">Total</div>
        <div id="box9-8">
            <p>Nature and Quantity of Goods</p>
            <p>(ind. Dimension or Volume)</p>
        </div>
    </div>
    <div id="row7">
        <div id="box10-1"><p>${packageCount}</p>
            <p id="b10-1-1">${packageCount}</p>
            </div>
            <div id="box10-2"><p>${totalInputWeight+totalVolumetricWeight}</p>
                <p id="b10-2-1">${totalInputWeight+totalVolumetricWeight}</p>
            </div>
            <div id="box10-3"><p>KG</p></div>
            <div id="box10-4">
                <div id="box9-4-2"><p>${goodsDescriptionsCodes}</p></div>
            </div>
            <div id="box10-5"><p>${totalInputWeight+totalVolumetricWeight}</p></div>
            <div id="box10-6"><p>${cargoRate}</p></div>
            <div id="box10-7"><p>22,750.00</p></div>
            <div id="box10-8"><p>MIS CARGO 82 @ 45.0x45.0x45.0 CM</p>
            </div>
    </div>
    <div id="row8">
        <div id="box11-1">
            <div id="prepaid">Prepaid</div>
            <div id="weight">Weight Charge</div>
            <div id="collect">Collect</div>
        </div>
        <div id="box11-2">
            <div id="line">
            <p style="margin-left:100px;">${rate}</p>
            </div>
        </div>
        <div id="box11-3">
            <div id="valuation">Valution Charge</div>
            <div id="line2"></div>
        </div>
    </div>
    <div id="row9">
        <div id="row9-1">
            <div id="tax">Tax</div>
            <div id="taxline"></div>
        </div>
    </div>
    <div id="row10">
        <div id="row10-1">
            <div id="r10-1-1">
                <div id="totalcharges">Total other charges Due Agent</div>
                <div id="totalchargesline"></div>
            </div>
            <div id="r10-1-1">
                <div id="totalcharges">Total other charges Due Carrier</div>
                <div id="totalchargesline"></div>
            </div>
            <div id="r10-1-3">
                <div id="temp01"></div>
                <div id="temp02"></div>
            </div>
        </div>
        <div id="row10-2">
         <p style="padding-left:2px;">I hereby declare that the contents of this consignment are fully and accurately described above by the proper shipping name, and are classified, packaged, marked and labelled, and are in all respects in proper condition for transport according to applicable in ransport enquiremenal gave mental regulations.</p>
        

            ID: 
            <hr class="dotted-hr">
            <p style="margin-left: 50%;">
                Signature of Shipper or his Agent
            </p>
            
        </div>
        </div>
        <div id="row11">
            <div id="row11-1">
                <div id="r11-1-1" class="bt">
                    <div id="temp03">
                        <div id="tprepaid">Pepaid</div>
                    </div>
                <div id="temp04">
                    <div id="tcollect">Total Collect</div>
                    <p style="margin-left:45%;">${rate}</p> 
                </div>
                </div>
                <div id="r11-1-2">
                    <div id="temp03">
                        <div id="tprepaid">Currency Conversion Rates</div>
                    </div>
                <div id="temp04">
                    <div id="tcollect">CC Charges in Dest. Currency</div>
                </div>
                </div>
                <div id="r11-1-3">
                    <div id="temp03">
                        For Carriers Use only at Destination
                    </div>
                <div id="temp04">
                    <div id="tcollect">Charges at Destination</div>
                </div>
                </div>
            </div>
            <div id="row11-2">
                <br><br><br><br><br> 14 January 2014 11:41 DUBAI HADI
                <hr class="dotted-hr">
                <p style="display: flex; justify-content:space-between"> <span>
                    Executed on
                </span>   
                <span>
                    (Date)
                </span>
                <span>at</span> <span>(Place) </span>
                        <span>Signature of Issuing Carrier or his Agent     </span></p>
                        <hr>
                        <div id="last">
                            <div id="value">Total Collect Charges</div>
                            <p style="margin-left:45%;">${rate}</p> 
                        </div>
            </div>
        </div>
        <p style="margin-left:80%;">${awb}, ${createdDate} </p>  
    </div>
    <!-- <div id="box8">
        <p>Handling Information:</p>
        <p>General Cargo Routing: DXD-MGQ-NBO</p>
    </div>
    <div id="box9">
        
    </div>
    <div id="box10">
        
    </div>
    <div id="box11">
        
    </div> -->
</div>
</body>
</html>
`
};