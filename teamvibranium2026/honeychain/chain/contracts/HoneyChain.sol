// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract HoneyChain {
    error NotOwner();
    error AlreadyRegistered();
    error InvalidRole();
    error NotRegistered();
    error RecipientNotRegistered(address recipient);
    error BatchExists();
    error BatchNotFound();
    error EmptyBatchId();
    error NotBeekeeper();
    error NotLab();
    error NotPacker();
    error NotAdmin();
    error ZeroAddress();
    error ZeroWeight();
    error ZeroJars();

    event ActorRegistered(address indexed actor, string name, string role);
    event ActorRevoked(address indexed actor);
    event BatchCreated(
        string indexed batchId,
        address indexed creator,
        string apiaryId,
        uint256 weightKg,
        string floraType,
        string photoHash
    );
    event CustodyTransferred(
        string indexed batchId,
        address indexed fromActor,
        address indexed toActor,
        uint256 weightKg,
        string geoHash,
        uint8 newStatus
    );
    event QualityAttached(
        string indexed batchId,
        address indexed labActor,
        string testType,
        bool passed,
        string certificateHash
    );
    event JarsMinted(string indexed batchId, address indexed packer, uint256 jarCount, string qrCode);
    event BatchFlagged(string indexed batchId, address indexed admin, string reason);

    string constant ROLE_BEEKEEPER = "beekeeper";
    string constant ROLE_FPO = "fpo";
    string constant ROLE_TRANSPORTER = "transporter";
    string constant ROLE_PROCESSOR = "processor";
    string constant ROLE_LAB = "lab";
    string constant ROLE_PACKER = "packer";
    string constant ROLE_ADMIN = "admin";

    uint8 constant STATUS_CREATED = 0;
    uint8 constant STATUS_IN_TRANSIT = 1;
    uint8 constant STATUS_RECEIVED = 2;
    uint8 constant STATUS_PROCESSED = 3;
    uint8 constant STATUS_PACKAGED = 4;
    uint8 constant STATUS_FLAGGED = 5;

    struct Actor {
        string name;
        string role;
        bool registered;
        bool exists;
    }

    struct Batch {
        string id;
        string apiaryId;
        uint256 weightKg;
        string floraType;
        string photoHash;
        uint8 status;
        address creator;
        uint256 createdAt;
        bool exists;
    }

    struct Transfer {
        string batchId;
        address fromActor;
        address toActor;
        uint256 weightKg;
        string geoHash;
        uint256 timestamp;
    }

    struct QualityRecord {
        string batchId;
        address labActor;
        string testType;
        bool passed;
        string certificateHash;
    }

    struct Package {
        string batchId;
        uint256 jarCount;
        string qrCode;
    }

    address public owner;
    uint256 public totalBatches;

    mapping(address => Actor) private _actors;
    mapping(string => Batch) private _batches;
    mapping(string => Transfer[]) private _custodyTrail;
    mapping(string => QualityRecord[]) private _qualityRecords;
    mapping(string => Package[]) private _packages;

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    modifier onlyRegistered() {
        if (!_actors[msg.sender].registered) revert NotRegistered();
        _;
    }

    constructor() {
        owner = msg.sender;
        Actor storage admin = _actors[msg.sender];
        admin.name = "Platform Admin";
        admin.role = ROLE_ADMIN;
        admin.registered = true;
        admin.exists = true;
        emit ActorRegistered(msg.sender, admin.name, admin.role);
    }

    function registerActor(string calldata name, string calldata role) external {
        if (!isValidRole(role)) revert InvalidRole();
        Actor storage actor = _actors[msg.sender];
        if (actor.exists && actor.registered) revert AlreadyRegistered();
        if (!actor.exists) {
            actor.name = name;
            actor.role = role;
            actor.exists = true;
        }
        actor.registered = true;
        emit ActorRegistered(msg.sender, actor.name, actor.role);
    }

    function revokeActor(address account) external onlyOwner {
        Actor storage actor = _actors[account];
        if (!actor.registered) revert NotRegistered();
        actor.registered = false;
        emit ActorRevoked(account);
    }

    function createBatch(
        string calldata id,
        string calldata apiaryId,
        uint256 weightKg,
        string calldata floraType,
        string calldata photoHash
    ) external onlyRegistered {
        if (!_hasRole(msg.sender, ROLE_BEEKEEPER)) revert NotBeekeeper();
        if (bytes(id).length == 0) revert EmptyBatchId();
        if (_batches[id].exists) revert BatchExists();
        if (weightKg == 0) revert ZeroWeight();

        Batch storage batch = _batches[id];
        batch.id = id;
        batch.apiaryId = apiaryId;
        batch.weightKg = weightKg;
        batch.floraType = floraType;
        batch.photoHash = photoHash;
        batch.status = STATUS_CREATED;
        batch.creator = msg.sender;
        batch.createdAt = block.timestamp;
        batch.exists = true;

        unchecked {
            ++totalBatches;
        }
        emit BatchCreated(id, msg.sender, apiaryId, weightKg, floraType, photoHash);
    }

    function transferCustody(
        string calldata batchId,
        address to,
        uint256 weightKg,
        string calldata geoHash
    ) external onlyRegistered {
        if (to == address(0)) revert ZeroAddress();
        if (!_batches[batchId].exists) revert BatchNotFound();
        if (!_actors[to].registered) revert RecipientNotRegistered(to);
        if (weightKg == 0) revert ZeroWeight();

        uint8 newStatus = _hasRole(to, ROLE_FPO) ? STATUS_RECEIVED : STATUS_IN_TRANSIT;
        _batches[batchId].status = newStatus;
        _custodyTrail[batchId].push(
            Transfer(batchId, msg.sender, to, weightKg, geoHash, block.timestamp)
        );

        emit CustodyTransferred(batchId, msg.sender, to, weightKg, geoHash, newStatus);
    }

    function attachQuality(
        string calldata batchId,
        string calldata testType,
        bool passed,
        string calldata certificateHash
    ) external {
        if (!_hasRole(msg.sender, ROLE_LAB)) revert NotLab();
        if (!_batches[batchId].exists) revert BatchNotFound();

        _qualityRecords[batchId].push(QualityRecord(batchId, msg.sender, testType, passed, certificateHash));
        emit QualityAttached(batchId, msg.sender, testType, passed, certificateHash);
    }

    function mintJars(string calldata batchId, uint256 jarCount, string calldata qrCode) external {
        if (!_hasRole(msg.sender, ROLE_PACKER)) revert NotPacker();
        if (!_batches[batchId].exists) revert BatchNotFound();
        if (jarCount == 0) revert ZeroJars();

        _packages[batchId].push(Package(batchId, jarCount, qrCode));
        _batches[batchId].status = STATUS_PACKAGED;
        emit JarsMinted(batchId, msg.sender, jarCount, qrCode);
    }

    function flagBatch(string calldata batchId, string calldata reason) external {
        if (!_hasRole(msg.sender, ROLE_ADMIN)) revert NotAdmin();
        if (!_batches[batchId].exists) revert BatchNotFound();

        _batches[batchId].status = STATUS_FLAGGED;
        emit BatchFlagged(batchId, msg.sender, reason);
    }

    function getBatch(string calldata batchId) external view returns (Batch memory) {
        if (!_batches[batchId].exists) revert BatchNotFound();
        return _batches[batchId];
    }

    function getBatchHistory(string calldata batchId) external view returns (Transfer[] memory) {
        if (!_batches[batchId].exists) revert BatchNotFound();
        return _custodyTrail[batchId];
    }

    function getQualityRecords(string calldata batchId) external view returns (QualityRecord[] memory) {
        if (!_batches[batchId].exists) revert BatchNotFound();
        return _qualityRecords[batchId];
    }

    function getPackages(string calldata batchId) external view returns (Package[] memory) {
        if (!_batches[batchId].exists) revert BatchNotFound();
        return _packages[batchId];
    }

    function isActor(address account) external view returns (string memory role, bool registered) {
        Actor storage actor = _actors[account];
        return (actor.role, actor.registered);
    }

    function _hasRole(address account, string memory role) private view returns (bool) {
        Actor storage actor = _actors[account];
        return actor.registered && keccak256(bytes(actor.role)) == keccak256(bytes(role));
    }

    function isValidRole(string memory role) private pure returns (bool) {
        bytes32 h = keccak256(bytes(role));
        return h == keccak256(bytes(ROLE_BEEKEEPER))
            || h == keccak256(bytes(ROLE_FPO))
            || h == keccak256(bytes(ROLE_TRANSPORTER))
            || h == keccak256(bytes(ROLE_PROCESSOR))
            || h == keccak256(bytes(ROLE_LAB))
            || h == keccak256(bytes(ROLE_PACKER))
            || h == keccak256(bytes(ROLE_ADMIN));
    }
}
