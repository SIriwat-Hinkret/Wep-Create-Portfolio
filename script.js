//**************************** ส่วนของพอร์ตที่ 1 ***********************************//
const form = document.querySelector("#profile-form");
//=====จาวาสคริปอ่านค่า=====
form.addEventListener("submit", function (event) {
    event.preventDefault();

    const name = document.querySelector("#displayName1").value.trim();
    const error = document.querySelector("#profile-error");
    //====เช็คว่าฟอร์มที่กรอกชื่อ ไม่ว่างเปล่า หากว่างเปล่าจะแจ้งเตือน====
    if (name === "") {
        error.textContent = "Please enter your name.";
        return;
    }
    error.textContent = "";

    //========อ่านค่าอินพุต========
    //ข้อมูลผู้ใช้
    const enjoy1 = document.querySelector("#enjoy1").value.trim();
    const tried1 = document.querySelector("#tried1").value.trim();
    const curious1 = document.querySelector("#curious1").value.trim();
    
    //พอร์ตไอเทมที่1
    const title1_1 = document.querySelector("#title1-1").value.trim();
    const type1_1 = document.querySelector("#type1-1").value.trim();
    const date1_1 = document.querySelector("#date1-1").value.trim();
    const role1_1 = document.querySelector("#role1-1").value.trim();
    const desc1_1 = document.querySelector("#desc1-1").value.trim();
    const skill1_1 = document.querySelector("#skill1-1").value.trim();
    const wid1_1 = document.querySelector("#wid1-1").value.trim();
    const wil1_1 = document.querySelector("#wil1-1").value.trim();
    const chln1_1 = document.querySelector("#chin1-1").value.trim();
    const nexts1_1 = document.querySelector("#nexts1-1").value.trim();
    const evid1_1 = document.querySelector("#evid1-1").value.trim();
    
    //พอร์ตไอเทมที่2
    const title1_2 = document.querySelector("#title1-2").value.trim();
    const type1_2 = document.querySelector("#type1-2").value.trim();
    const date1_2 = document.querySelector("#date1-2").value.trim();
    const role1_2 = document.querySelector("#role1-2").value.trim();
    const desc1_2 = document.querySelector("#desc1-2").value.trim();
    const skill1_2 = document.querySelector("#skill1-2").value.trim();
    const wid1_2 = document.querySelector("#wid1-2").value.trim();
    const wil1_2 = document.querySelector("#wil1-2").value.trim();
    const chln1_2 = document.querySelector("#chin1-2").value.trim();
    const nexts1_2 = document.querySelector("#nexts1-2").value.trim();
    const evid1_2 = document.querySelector("#evid1-2").value.trim();

    //========สร้าง JavaScript Object========
    const portfolio = {
        DisplayName: name,
        WhatIEnjoy: enjoy1,
        WhatIveTried: tried1,
        WhatImCuriousAbout: curious1,
        
        TitleA: title1_1,
        TypeA: type1_1,
        DateA: date1_1,
        RoleA: role1_1,
        DescriptionA: desc1_1,
        SkillA: skill1_1,
        WhatIDidA: wid1_1,
        WhatILearnA: wil1_1,
        ChallengeA: chln1_1,
        NextStepA: nexts1_1,
        EvidenceA: evid1_1,
        
        TitleB: title1_2,
        TypeB: type1_2,
        DateB: date1_2,
        RoleB: role1_2,
        DescriptionB: desc1_2,
        SkillB: skill1_2,
        WhatIDidB: wid1_2,
        WhatILearnB: wil1_2,
        ChallengeB: chln1_2,
        NextStepB: nexts1_2,
        EvidenceB: evid1_2,
    };
    localStorage.setItem("portfolio1", JSON.stringify(portfolio));
    //========อัปเดตผลลัพธ์หน้าเว็บ ด้วย Object========
    // แสดงเนื้อหาข้อมูลผู้ใช้
    document.querySelector("#portfolio-enjoy1").textContent = portfolio.WhatIEnjoy;
    document.querySelector("#portfolio-tried1").textContent = portfolio.WhatIveTried;
    document.querySelector("#portfolio-curious1").textContent = portfolio.WhatImCuriousAbout;
    document.querySelector("#portfolio-name1").textContent = portfolio.DisplayName;

    // แสดงเนื้อหา พอร์ตไอเทม 1
    document.querySelector("#portfolio-title1-1").textContent = portfolio.TitleA;
    document.querySelector("#portfolio-type1-1").textContent = portfolio.TypeA;
    document.querySelector("#portfolio-date1-1").textContent = portfolio.DateA;
    document.querySelector("#portfolio-role1-1").textContent = portfolio.RoleA;
    document.querySelector("#portfolio-desc1-1").textContent = portfolio.DescriptionA;
    document.querySelector("#portfolio-skill1-1").textContent = portfolio.SkillA;
    document.querySelector("#portfolio-wid1-1").textContent = portfolio.WhatIDidA;
    document.querySelector("#portfolio-wil1-1").textContent = portfolio.WhatILearnA;
    document.querySelector("#portfolio-chin1-1").textContent = portfolio.ChallengeA;
    document.querySelector("#portfolio-nexts1-1").textContent = portfolio.NextStepA;
    document.querySelector("#portfolio-evid1-1").textContent = portfolio.EvidenceA;

    // แสดงเนื้อหา พอร์ตไอเทม 2
    document.querySelector("#portfolio-title1-2").textContent = portfolio.TitleB;
    document.querySelector("#portfolio-type1-2").textContent = portfolio.TypeB;
    document.querySelector("#portfolio-date1-2").textContent = portfolio.DateB;
    document.querySelector("#portfolio-role1-2").textContent = portfolio.RoleB;
    document.querySelector("#portfolio-desc1-2").textContent = portfolio.DescriptionB;
    document.querySelector("#portfolio-skill1-2").textContent = portfolio.SkillB;
    document.querySelector("#portfolio-wid1-2").textContent = portfolio.WhatIDidB;
    document.querySelector("#portfolio-wil1-2").textContent = portfolio.WhatILearnB;
    document.querySelector("#portfolio-chin1-2").textContent = portfolio.ChallengeB;
    document.querySelector("#portfolio-nexts1-2").textContent = portfolio.NextStepB;
    document.querySelector("#portfolio-evid1-2").textContent = portfolio.EvidenceB;
});

const savedPortfolio = localStorage.getItem("portfolio1");
if (savedPortfolio) {
    const p = JSON.parse(savedPortfolio);

    document.querySelector("#portfolio-name1").textContent = p.DisplayName;
    document.querySelector("#portfolio-enjoy1").textContent = p.WhatIEnjoy;
    document.querySelector("#portfolio-tried1").textContent = p.WhatIveTried;
    document.querySelector("#portfolio-curious1").textContent = p.WhatImCuriousAbout;

    document.querySelector("#portfolio-title1-1").textContent = p.TitleA;
    document.querySelector("#portfolio-type1-1").textContent = p.TypeA;
    document.querySelector("#portfolio-date1-1").textContent = p.DateA;
    document.querySelector("#portfolio-role1-1").textContent = p.RoleA;
    document.querySelector("#portfolio-desc1-1").textContent = p.DescriptionA;
    document.querySelector("#portfolio-skill1-1").textContent = p.SkillA;
    document.querySelector("#portfolio-wid1-1").textContent = p.WhatIDidA;
    document.querySelector("#portfolio-wil1-1").textContent = p.WhatILearnA;
    document.querySelector("#portfolio-chin1-1").textContent = p.ChallengeA;
    document.querySelector("#portfolio-nexts1-1").textContent = p.NextStepA;
    document.querySelector("#portfolio-evid1-1").textContent = p.EvidenceA;

    document.querySelector("#portfolio-title1-2").textContent = p.TitleB;
    document.querySelector("#portfolio-type1-2").textContent = p.TypeB;
    document.querySelector("#portfolio-date1-2").textContent = p.DateB;
    document.querySelector("#portfolio-role1-2").textContent = p.RoleB;
    document.querySelector("#portfolio-desc1-2").textContent = p.DescriptionB;
    document.querySelector("#portfolio-skill1-2").textContent = p.SkillB;
    document.querySelector("#portfolio-wid1-2").textContent = p.WhatIDidB;
    document.querySelector("#portfolio-wil1-2").textContent = p.WhatILearnB;
    document.querySelector("#portfolio-chin1-2").textContent = p.ChallengeB;
    document.querySelector("#portfolio-nexts1-2").textContent = p.NextStepB;
    document.querySelector("#portfolio-evid1-2").textContent = p.EvidenceB;
}

//************************** ส่วนของพอร์ตที่ 2 ************************** {ห้ามประกาศตัวแปรและใช้ไอดรซ้ำกัน เด็ดขาด!!!!}*//
const form2 = document.querySelector("#profile-form2");
form2.addEventListener("submit", function (event) {
    event.preventDefault();

    const name = document.querySelector("#displayName2").value.trim();
    const error = document.querySelector("#profile-error2");
    //====เช็คว่าฟอร์มที่กรอกชื่อ ไม่ว่างเปล่า หากว่างเปล่าจะแจ้งเตือน====
    if (name === "") {
        error.textContent = "Please enter your name.";
        return;
    }
    error.textContent = "";

    //========อ่านค่าอินพุต========
    //ข้อมูลผู้ใช้
    const enjoy1 = document.querySelector("#enjoy2").value.trim();
    const tried1 = document.querySelector("#tried2").value.trim();
    const curious1 = document.querySelector("#curious2").value.trim();
    
    //พอร์ตไอเทมที่1
    const title1_1 = document.querySelector("#title2-1").value.trim();
    const type1_1 = document.querySelector("#type2-1").value.trim();
    const date1_1 = document.querySelector("#date2-1").value.trim();
    const role1_1 = document.querySelector("#role2-1").value.trim();
    const desc1_1 = document.querySelector("#desc2-1").value.trim();
    const skill1_1 = document.querySelector("#skill2-1").value.trim();
    const wid1_1 = document.querySelector("#wid2-1").value.trim();
    const wil1_1 = document.querySelector("#wil2-1").value.trim();
    const chln1_1 = document.querySelector("#chin2-1").value.trim();
    const nexts1_1 = document.querySelector("#nexts2-1").value.trim();
    const evid1_1 = document.querySelector("#evid2-1").value.trim();
    
    //พอร์ตไอเทมที่2
    const title1_2 = document.querySelector("#title2-2").value.trim();
    const type1_2 = document.querySelector("#type2-2").value.trim();
    const date1_2 = document.querySelector("#date2-2").value.trim();
    const role1_2 = document.querySelector("#role2-2").value.trim();
    const desc1_2 = document.querySelector("#desc2-2").value.trim();
    const skill1_2 = document.querySelector("#skill2-2").value.trim();
    const wid1_2 = document.querySelector("#wid2-2").value.trim();
    const wil1_2 = document.querySelector("#wil2-2").value.trim();
    const chln1_2 = document.querySelector("#chin2-2").value.trim();
    const nexts1_2 = document.querySelector("#nexts2-2").value.trim();
    const evid1_2 = document.querySelector("#evid2-2").value.trim();

    //========สร้าง JavaScript Object========
    const portfolio = {
        DisplayName: name,
        WhatIEnjoy: enjoy1,
        WhatIveTried: tried1,
        WhatImCuriousAbout: curious1,
        
        TitleA: title1_1,
        TypeA: type1_1,
        DateA: date1_1,
        RoleA: role1_1,
        DescriptionA: desc1_1,
        SkillA: skill1_1,
        WhatIDidA: wid1_1,
        WhatILearnA: wil1_1,
        ChallengeA: chln1_1,
        NextStepA: nexts1_1,
        EvidenceA: evid1_1,
        
        TitleB: title1_2,
        TypeB: type1_2,
        DateB: date1_2,
        RoleB: role1_2,
        DescriptionB: desc1_2,
        SkillB: skill1_2,
        WhatIDidB: wid1_2,
        WhatILearnB: wil1_2,
        ChallengeB: chln1_2,
        NextStepB: nexts1_2,
        EvidenceB: evid1_2,
    };
    localStorage.setItem("portfolio2", JSON.stringify(portfolio));
    //========อัปเดตผลลัพธ์หน้าเว็บ ด้วย Object========
    // แสดงเนื้อหาข้อมูลผู้ใช้
    document.querySelector("#portfolio-enjoy2").textContent = portfolio.WhatIEnjoy;
    document.querySelector("#portfolio-tried2").textContent = portfolio.WhatIveTried;
    document.querySelector("#portfolio-curious2").textContent = portfolio.WhatImCuriousAbout;
    document.querySelector("#portfolio-name2").textContent = portfolio.DisplayName;

    // แสดงเนื้อหา พอร์ตไอเทม 1
    document.querySelector("#portfolio-title2-1").textContent = portfolio.TitleA;
    document.querySelector("#portfolio-type2-1").textContent = portfolio.TypeA;
    document.querySelector("#portfolio-date2-1").textContent = portfolio.DateA;
    document.querySelector("#portfolio-role2-1").textContent = portfolio.RoleA;
    document.querySelector("#portfolio-desc2-1").textContent = portfolio.DescriptionA;
    document.querySelector("#portfolio-skill2-1").textContent = portfolio.SkillA;
    document.querySelector("#portfolio-wid2-1").textContent = portfolio.WhatIDidA;
    document.querySelector("#portfolio-wil2-1").textContent = portfolio.WhatILearnA;
    document.querySelector("#portfolio-chin2-1").textContent = portfolio.ChallengeA;
    document.querySelector("#portfolio-nexts2-1").textContent = portfolio.NextStepA;
    document.querySelector("#portfolio-evid2-1").textContent = portfolio.EvidenceA;

    // แสดงเนื้อหา พอร์ตไอเทม 2
    document.querySelector("#portfolio-title2-2").textContent = portfolio.TitleB;
    document.querySelector("#portfolio-type2-2").textContent = portfolio.TypeB;
    document.querySelector("#portfolio-date2-2").textContent = portfolio.DateB;
    document.querySelector("#portfolio-role2-2").textContent = portfolio.RoleB;
    document.querySelector("#portfolio-desc2-2").textContent = portfolio.DescriptionB;
    document.querySelector("#portfolio-skill2-2").textContent = portfolio.SkillB;
    document.querySelector("#portfolio-wid2-2").textContent = portfolio.WhatIDidB;
    document.querySelector("#portfolio-wil2-2").textContent = portfolio.WhatILearnB;
    document.querySelector("#portfolio-chin2-2").textContent = portfolio.ChallengeB;
    document.querySelector("#portfolio-nexts2-2").textContent = portfolio.NextStepB;
    document.querySelector("#portfolio-evid2-2").textContent = portfolio.EvidenceB;
});

const savedPortfolio2 = localStorage.getItem("portfolio2");
if (savedPortfolio2) {
    const p = JSON.parse(savedPortfolio2);

    document.querySelector("#portfolio-name2").textContent = p.DisplayName;
    document.querySelector("#portfolio-enjoy2").textContent = p.WhatIEnjoy;
    document.querySelector("#portfolio-tried2").textContent = p.WhatIveTried;
    document.querySelector("#portfolio-curious2").textContent = p.WhatImCuriousAbout;

    document.querySelector("#portfolio-title2-1").textContent = p.TitleA;
    document.querySelector("#portfolio-type2-1").textContent = p.TypeA;
    document.querySelector("#portfolio-date2-1").textContent = p.DateA;
    document.querySelector("#portfolio-role2-1").textContent = p.RoleA;
    document.querySelector("#portfolio-desc2-1").textContent = p.DescriptionA;
    document.querySelector("#portfolio-skill2-1").textContent = p.SkillA;
    document.querySelector("#portfolio-wid2-1").textContent = p.WhatIDidA;
    document.querySelector("#portfolio-wil2-1").textContent = p.WhatILearnA;
    document.querySelector("#portfolio-chin2-1").textContent = p.ChallengeA;
    document.querySelector("#portfolio-nexts2-1").textContent = p.NextStepA;
    document.querySelector("#portfolio-evid2-1").textContent = p.EvidenceA;

    document.querySelector("#portfolio-title2-2").textContent = p.TitleB;
    document.querySelector("#portfolio-type2-2").textContent = p.TypeB;
    document.querySelector("#portfolio-date2-2").textContent = p.DateB;
    document.querySelector("#portfolio-role2-2").textContent = p.RoleB;
    document.querySelector("#portfolio-desc2-2").textContent = p.DescriptionB;
    document.querySelector("#portfolio-skill2-2").textContent = p.SkillB;
    document.querySelector("#portfolio-wid2-2").textContent = p.WhatIDidB;
    document.querySelector("#portfolio-wil2-2").textContent = p.WhatILearnB;
    document.querySelector("#portfolio-chin2-2").textContent = p.ChallengeB;
    document.querySelector("#portfolio-nexts2-2").textContent = p.NextStepB;
    document.querySelector("#portfolio-evid2-2").textContent = p.EvidenceB;
}

// แจ้งเตือนเมื่อ Display name เป็นช่องว่างล้วน
document.querySelector("#displayName1").addEventListener("input", function () {
    this.setCustomValidity(this.value.trim() === "" ? "Please enter your name." : "");
});
document.querySelector("#displayName2").addEventListener("input", function () {
    this.setCustomValidity(this.value.trim() === "" ? "Please enter your name." : "");
});