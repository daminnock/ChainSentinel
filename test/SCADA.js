const { expect } = require("chai");
const { ethers } = require("hardhat");

describe('SCADA contract', () => {
    it('Should create a new slave', async () => {
        const SCADA = await ethers.getContractFactory("SCADA");

        /* Es un deploy de una red interna que nos ofrece hardhat */
        const hardhatSCADA = await SCADA.deploy();
        await hardhatSCADA.deployed();

        const [owner] = await ethers.getSigners(); // will be used to get the address that hardhat is using. in .sol is msg.sender 

        await expect(hardhatSCADA.CreateSlave("0x1234567890123456789012345678901234567890"))
        .to.emit(hardhatSCADA, "eventSomethingNew")
        .withArgs(owner.address,"created a new slave with address", "0x1234567890123456789012345678901234567890");

    });

    it('Should create two slaves with process objects.', async () => {
        const SCADA = await ethers.getContractFactory("SCADA");

        const hardhatSCADA = await SCADA.deploy();
        await hardhatSCADA.deployed();

        const [owner] = await ethers.getSigners(); // will be used to get the address that hardhat is using. in .sol is msg.sender 

        hardhatSCADA.CreateSlave("0x1111111111111111111111111111111111111111")
        hardhatSCADA.CreateBinaryInputs("0x1111111111111111111111111111111111111111",2)

        hardhatSCADA.CreateSlave("0x2222222222222222222222222222222222222222")
        hardhatSCADA.CreateBinaryInputs("0x2222222222222222222222222222222222222222",3)

        hardhatSCADA.CreateBinaryInputs("0x1111111111111111111111111111111111111111",2)

        var DB = await hardhatSCADA.ReadDB();
        expect(DB.length).to.equal(2)
        expect(DB[0].BI_val.length).to.equal(4)
        expect(DB[1].BI_val.length).to.equal(3)

    });

    it('Should create two slaves with process objects. Then write them.', async () => {
        const SCADA = await ethers.getContractFactory("SCADA");
        const hardhatSCADA = await SCADA.deploy();
        await hardhatSCADA.deployed();
    
        const [owner, slave1, slave2] = await ethers.getSigners();
    
        await hardhatSCADA.CreateSlave(slave1.address);
        await hardhatSCADA.CreateBinaryInputs(slave1.address, 2);
        
        // Connect as slave1
        const connectedContract = hardhatSCADA.connect(slave1);
        // Define process object
        const processObjects = {
            BI_val: [true, false, true],
            BI_q: [0, 0, 0],
            BI_t: [1683258250, 1683258251, 1683258252],
            AI_Val: [],
            AI_q: [],
            AI_t: [],
            BO_Val: [],
            BO_q: [],
            BO_t: []
        };
        // Call function as slave1
        await connectedContract.setProcessObjects(
            processObjects.BI_val,
            processObjects.BI_q,
            processObjects.BI_t,
            processObjects.AI_Val,
            processObjects.AI_q,
            processObjects.AI_t,
            processObjects.BO_Val,
            processObjects.BO_q,
            processObjects.BO_t
        );
    
        const DB = await hardhatSCADA.ReadDB();
        expect(DB[0].BI_val[0]).to.equal(true);
        expect(DB[0].BI_val[1]).to.equal(false);
        expect(DB[0].BI_val[2]).to.equal(true);
        expect(DB[0].BI_q[0]).to.equal(0);
        expect(DB[0].BI_q[1]).to.equal(0);
        expect(DB[0].BI_q[2]).to.equal(0);
        expect(DB[0].BI_t[0]).to.equal(1683258250);
        expect(DB[0].BI_t[1]).to.equal(1683258251);
        expect(DB[0].BI_t[2]).to.equal(1683258252);
    }); 
    
});