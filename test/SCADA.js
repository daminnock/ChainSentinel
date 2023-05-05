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

    it('Should create a two slaves with process objects.', async () => {
        const SCADA = await ethers.getContractFactory("SCADA");

        /* Es un deploy de una red interna que nos ofrece hardhat */
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

});