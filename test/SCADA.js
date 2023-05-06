const { expect } = require("chai");
const { ethers } = require("hardhat");

describe('SCADA contract', () => {
    it('Should create a new slave', async () => {
        // Local deploy with hardhat
        const SCADA = await ethers.getContractFactory("SCADA");
        const hardhatSCADA = await SCADA.deploy();
        await hardhatSCADA.deployed();

        // Will be used to get the address that hardhat is using. in .sol is msg.sender
        const [owner] = await ethers.getSigners();  

        // Create a slave with a dummy address and check if the event is emited correctly
        await expect(hardhatSCADA.CreateSlave("0x1234567890123456789012345678901234567890"))
        .to.emit(hardhatSCADA, "eventSomethingNew")
        .withArgs(owner.address,"created a new slave with address", "0x1234567890123456789012345678901234567890");

    });

    it('Should create two slaves with process objects.', async () => {
        // Local deploy with hardhat
        const SCADA = await ethers.getContractFactory("SCADA");
        const hardhatSCADA = await SCADA.deploy();
        await hardhatSCADA.deployed();

        // Will be used to get the address that hardhat is using. in .sol is msg.sender
        const [owner] = await ethers.getSigners();
        
        // Create a slave with a dummy address. Also create 2 binary inputs.
        hardhatSCADA.CreateSlave("0x1111111111111111111111111111111111111111")
        hardhatSCADA.CreateBinaryInputs("0x1111111111111111111111111111111111111111",2)

        // Create a slave with a dummy address. Also create 3 binary inputs.
        hardhatSCADA.CreateSlave("0x2222222222222222222222222222222222222222")
        hardhatSCADA.CreateBinaryInputs("0x2222222222222222222222222222222222222222",3)

        // Add two more addresses to the first slave. It should have a total of 4 binary inputs.
        hardhatSCADA.CreateBinaryInputs("0x1111111111111111111111111111111111111111",2)

        // Get complete DB=Database. In SCADA.sol it corresponds to the value of 'slaves' struct array.
        var DB = await hardhatSCADA.ReadDB();

        // Just make some counts. As we have two slaves, the size of the DB is two.
        expect(DB.length).to.equal(2)
        // Count that the first slave has 4 binary inputs.
        expect(DB[0].BI_val.length).to.equal(4)
        // Count that the second slave has 3 binary inputs.
        expect(DB[1].BI_val.length).to.equal(3)

    });

    it('Should create one slave with process objects. Then write values as if it is the slave. Then read them as an HMI.', async () => {
        // Local deploy with hardhat
        const SCADA = await ethers.getContractFactory("SCADA");
        const hardhatSCADA = await SCADA.deploy();
        await hardhatSCADA.deployed();
    
        // get the addresses. owner should be the address of a root or engineering account. slave 1 corresponds to the address of a slave.
        //
        const [owner, slave1, HMI] = await ethers.getSigners();
    
        await hardhatSCADA.CreateSlave(slave1.address);
        await hardhatSCADA.CreateBinaryInputs(slave1.address, 3);
        await hardhatSCADA.CreateAnalogInputs(slave1.address, 5);
        await hardhatSCADA.CreateBinaryOutputs(slave1.address, 2);

        // Connect as slave1
        const slave1ContractConnection = hardhatSCADA.connect(slave1);
        // Define process object
        const processObjects = {
            BI_val: [true, false, true],
            BI_q:   [0, 0, 0],
            BI_t:   [1683258250, 1683258251, 1683258252],
            AI_Val: [12345,6789,101112,-1314,0],
            AI_q:   [0,2,3,10,0],
            AI_t:   [1683258250, 1683258251, 1683258252,1683258250, 1683258251],
            BO_Val: [false,false],
            BO_q:   [10,10],
            BO_t:   [1683258240, 1683258241]
        };
        // Call function as slave1 to set all the process objects
        await slave1ContractConnection.setProcessObjects(
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
    
        // Connect as HMI
        const HMIContractConnection = hardhatSCADA.connect(HMI);
        // Read everything
        const DB = await HMIContractConnection.ReadDB();

        // Read expected values
        expect(DB[0].BI_val[0]).to.equal(true);
        expect(DB[0].BI_val[1]).to.equal(false);
        expect(DB[0].BI_val[2]).to.equal(true);
        expect(DB[0].BI_q[0]).to.equal(0);
        expect(DB[0].BI_q[1]).to.equal(0);
        expect(DB[0].BI_q[2]).to.equal(0);
        expect(DB[0].BI_t[0]).to.equal(1683258250);
        expect(DB[0].BI_t[1]).to.equal(1683258251);
        expect(DB[0].BI_t[2]).to.equal(1683258252);

        expect(DB[0].AI_val[0]).to.equal(12345);
        expect(DB[0].AI_val[1]).to.equal(6789);
        expect(DB[0].AI_val[2]).to.equal(101112);
        expect(DB[0].AI_val[3]).to.equal(-1314);
        expect(DB[0].AI_val[4]).to.equal(0);
        expect(DB[0].AI_q[0]).to.equal(0);
        expect(DB[0].AI_q[1]).to.equal(2);
        expect(DB[0].AI_q[2]).to.equal(3);
        expect(DB[0].AI_q[3]).to.equal(10);
        expect(DB[0].AI_q[4]).to.equal(0);
        expect(DB[0].AI_t[0]).to.equal(1683258250);
        expect(DB[0].AI_t[1]).to.equal(1683258251);
        expect(DB[0].AI_t[2]).to.equal(1683258252);
        expect(DB[0].AI_t[3]).to.equal(1683258250);
        expect(DB[0].AI_t[4]).to.equal(1683258251);

        expect(DB[0].BO_val[0]).to.equal(false);
        expect(DB[0].BO_val[1]).to.equal(false);
        expect(DB[0].BO_q[0]).to.equal(10);
        expect(DB[0].BO_q[1]).to.equal(10);
        expect(DB[0].BO_t[0]).to.equal(1683258240);
        expect(DB[0].BO_t[1]).to.equal(1683258241);

    }); 


    it('Should create a slave. Then an HMI should send commands to BOs.', async () => {
        // Local deploy with hardhat
        const SCADA = await ethers.getContractFactory("SCADA");
        const hardhatSCADA = await SCADA.deploy();
        await hardhatSCADA.deployed();
    
        // get the addresses. owner should be the address of a root or engineering account. slave 1 corresponds to the address of a slave.
        //
        const [owner, slave1, HMI] = await ethers.getSigners();
    
        await hardhatSCADA.CreateSlave(slave1.address);
        await hardhatSCADA.CreateBinaryInputs(slave1.address, 3);
        await hardhatSCADA.CreateAnalogInputs(slave1.address, 5);
        await hardhatSCADA.CreateBinaryOutputs(slave1.address, 2);

        // Connect as slave1
        const slave1ContractConnection = hardhatSCADA.connect(slave1);
        // Define process object
        const processObjects = {
            BI_val: [true, false, true],
            BI_q:   [0, 0, 0],
            BI_t:   [1683258250, 1683258251, 1683258252],
            AI_Val: [12345,6789,101112,-1314,0],
            AI_q:   [0,2,3,10,0],
            AI_t:   [1683258250, 1683258251, 1683258252,1683258250, 1683258251],
            BO_Val: [false,false],
            BO_q:   [10,10],
            BO_t:   [1683258240, 1683258241]
        };
        // Call function as slave1 to set all the process objects
        await slave1ContractConnection.setProcessObjects(
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
    
        // Connect as HMI
        const HMIContractConnection = hardhatSCADA.connect(HMI);
        // Read everything
        DB = await HMIContractConnection.ReadDB();

        // Read expected values
        expect(DB[0].BO_val[0]).to.equal(false);
        expect(DB[0].BO_val[1]).to.equal(false);
        expect(DB[0].BO_q[0]).to.equal(10);
        expect(DB[0].BO_q[1]).to.equal(10);
        expect(DB[0].BO_t[0]).to.equal(1683258240);
        expect(DB[0].BO_t[1]).to.equal(1683258241);

        // HMI sends a command to a slave that does not exist
        await expect(HMIContractConnection.SetBO("0x1111111111111111111111111111111111111111",100,true,0,1683258241))
        .to.be.revertedWith("Slave not found in DB")

        // HMI sends a command to a slave that exists but the Binary Output does not exist
        await expect(HMIContractConnection.SetBO(slave1.address,100,true,0,1683258241))
        .to.be.revertedWith("BO index out of range")

        // HMI sends a command to a slave with a Binary Output that exists correctly.
        await expect(HMIContractConnection.SetBO(slave1.address,1,true,0,1683258299))
        DB = await HMIContractConnection.ReadDB();
        expect(DB[0].BO_val[0]).to.equal(false);
        expect(DB[0].BO_val[1]).to.equal(true);
        expect(DB[0].BO_q[0]).to.equal(10);
        expect(DB[0].BO_q[1]).to.equal(0);
        expect(DB[0].BO_t[0]).to.equal(1683258240);
        expect(DB[0].BO_t[1]).to.equal(1683258299);       

    }); 
    
});




