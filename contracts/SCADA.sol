// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

contract SCADA {
    // Structs inside a struct is not supported yet. So this structure is the best option.
    struct slave {
        address slave_address;
        bool[] BI_val;
        uint[] BI_q;
        uint[] BI_t;
        int[] AI_val;
        uint[] AI_q;
        uint[] AI_t;
        bool[] BO_val;
        uint[] BO_q;
        uint[] BO_t;
    }

    slave[] private slaves;
    uint private n_slaves;

    event eventSomethingNew(address sender, string message, address _slave_address);

    /* ##################################################################################################################################################################### */
    /* This section contains functions for the HMI /*
    /* ##################################################################################################################################################################### */
    /**
     * @dev Creates a new slave with empty inputs and outputs
     * @param _slave_address Address from the slave that will provide the data
     */
    function CreateSlave (address _slave_address) public {
        slave memory newSlave = slave({
            slave_address: _slave_address,
            BI_val: new bool[](0),
            BI_q: new uint[](0),
            BI_t: new uint[](0),
            AI_val: new int[](0),
            AI_q: new uint[](0),
            AI_t: new uint[](0),
            BO_val: new bool[](0),
            BO_q: new uint[](0),
            BO_t: new uint[](0)
        });
        slaves.push(newSlave);
        n_slaves++;

        emit eventSomethingNew(msg.sender, "created a new slave with address", _slave_address);
        /*TODO: Check if the slave does not already exist */
    }

    /**
     * @dev Function to count all the slaves created
     * @return Total number of slaves created
     */
    function GetTotalSlaves() public view returns (uint) {
        return n_slaves-1;
    }

    /**
     * @dev Function to create Binary Inputs
     * @param _slave_address Address from slave that will provide Binary Inputs values
     * @param quantity Quantity of Binary Inputs to create
     */
    function CreateBinaryInputs(address _slave_address, uint quantity) public {
        uint index = findSlaveIndex(_slave_address); //TODO: simplify with mappings if possible
        require(index != slaves.length, "Slave not found");
        //Create empty arrays that will correspondes to the BI
        bool[] memory boolArray = new bool[](quantity);
        uint[] memory uintArray = new uint[](quantity);
        slaves[index].BI_val = boolArray;
        slaves[index].BI_q = uintArray;
        slaves[index].BI_t = uintArray;       
        emit eventSomethingNew(msg.sender, "New Binary Inputs created for address", _slave_address);
        }

    /**
     * @dev Function to create Analog Inputs
     * @param _slave_address Address from Slave that will provide Analog Inputs values
     * @param quantity Quantity of Analog Inputs to create
     */
    function CreateAnalogInputs(address _slave_address, uint quantity) public {
        uint index = findSlaveIndex(_slave_address); /*TODO: simplify with mappings if possible */
        require(index != slaves.length, "Slave not found");
        //Create empty arrays that will correspondes to the AI
        uint[] memory uintArray = new uint[](quantity);
        int[] memory intArray = new int[](quantity);
        slaves[index].AI_val = intArray;
        slaves[index].AI_q = uintArray;
        slaves[index].AI_t = uintArray;       
        emit eventSomethingNew(msg.sender, "New Analog Inputs created for address", _slave_address);
        }

    /**
     * @dev Function to create Binary Outputs
     * @param _slave_address Address from slave that will provide Binary Outputs values
     * @param quantity Quantity of Binary Outputs to create
     */
    function CreateBinaryOutputs(address _slave_address, uint quantity) public {
        uint index = findSlaveIndex(_slave_address); /*TODO: simplify with mappings if possible */
        require(index != slaves.length, "Slave not found");
        //Create empty arrays that will correspondes to the BO
        bool[] memory boolArray = new bool[](quantity);
        uint[] memory uintArray = new uint[](quantity);
        slaves[index].BO_val = boolArray;
        slaves[index].BO_q = uintArray;
        slaves[index].BO_t = uintArray;       
        emit eventSomethingNew(msg.sender, "New Binary Outputs created for address", _slave_address);
        }

    /**
     * @dev Function to get index of the slave according to its address
     * @return slave[] Returns all the objects.
     * TODO: it may be replaced with mappings
     */
    function ReadDB() public view returns (slave[] memory) {
      return slaves;
    }

    /**
     * @dev Function to get index of the slave according to its address
     * @param _slave_address Address from where it's neccesary to get the index in the struct
     * @return index that corresponds to the address of the slave
     * TODO: it may be replaced with mappings
     */
    function findSlaveIndex(address _slave_address) internal view returns (uint) {
        for (uint i = 0; i < slaves.length; i++) {
            if (slaves[i].slave_address == _slave_address) {
                return i;
            }
        }
        return slaves.length;
    }

     /**
     * @dev Function to send a command by setting a BO
     * @param slave_address Address of the slave
     * @param BO_index Index of the BO that needs to be set
     * @param _BO_val Binary Output that should receive the command
     * @param _BO_q quality for the BO
     * @param _BO_t timestamp of when the command was sent
     * TODO: implement return status code
     */
    function SetBO(
        address slave_address,
        uint BO_index,
        bool _BO_val, 
        uint _BO_q, 
        uint _BO_t
    ) public {
        uint slave_index = findSlaveIndex(slave_address);
        require(slave_index != slaves.length, "Slave not found in DB");
        require(BO_index < slaves[slave_index].BO_val.length, "BO index out of range");
        // Assign values to the specific Binary Output
        slaves[slave_index].BO_val[BO_index] = _BO_val;
        slaves[slave_index].BO_q[BO_index] = _BO_q;
        slaves[slave_index].BO_t[BO_index] = _BO_t;
        //TODO: send event command to the slave.
    }

    /* ##################################################################################################################################################################### */
    /* This section contains functions for the slaves /*
    /* ##################################################################################################################################################################### */
     /**
     * @dev Function to set values from slave
     * @param _BI_val array with values from BIs
     * @param _BI_q array with quality from BIs
     * @param _BI_t array with timestamps from BIs
     * @param _AI_val array with values from AIs
     * @param _AI_q array with quality from AIs
     * @param _AI_t array with timestamps from AIs
     * @param _BO_val array with values from BOs
     * @param _BO_q array with quality from BOs
     * @param _BO_t array with timestamp from BOs
     * TODO: implement return status code
     */
    function setProcessObjects(
        bool[] memory _BI_val, 
        uint[] memory _BI_q, 
        uint[] memory _BI_t, 
        int[] memory _AI_val, 
        uint[] memory _AI_q, 
        uint[] memory _AI_t,
        bool[] memory _BO_val, 
        uint[] memory _BO_q, 
        uint[] memory _BO_t
    ) public {
        uint index = findSlaveIndex(msg.sender);
        require(index != slaves.length, "Slave not found in DB");

        slave memory SlaveData = slave({
            slave_address: msg.sender,
            BI_val: _BI_val,
            BI_q: _BI_q,
            BI_t: _BI_t,
            AI_val: _AI_val,
            AI_q: _AI_q,
            AI_t: _AI_t,
            BO_val: _BO_val,
            BO_q: _BO_q,
            BO_t: _BO_t
        });

        //TODO: check if array have the same quantity of process objects
        slaves[index] = SlaveData;
    }
    
}
 