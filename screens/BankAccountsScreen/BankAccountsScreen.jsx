import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Modal,
    ActivityIndicator,
    Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { bankAccountService } from "../../service/bankAccountService";
import { useToast } from "../../hooks/use-toast";
import styles from "./BankAccountsScreen.styles";

export default function BankAccountsScreen() {
    const navigation = useNavigation();
    const { toast } = useToast();

    // State
    const [bankAccounts, setBankAccounts] = useState([]);
    const [banks, setBanks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);

    // Modal states
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    // Form states
    const [selectedBank, setSelectedBank] = useState(null);
    const [accountNumber, setAccountNumber] = useState("");
    const [accountHolderName, setAccountHolderName] = useState("");
    const [bankSearchQuery, setBankSearchQuery] = useState("");
    const [editingAccount, setEditingAccount] = useState(null);
    const [deletingAccount, setDeletingAccount] = useState(null);

    // Fetch data
    useEffect(() => {
        fetchBankAccounts();
        fetchBanks();
    }, []);

    const fetchBankAccounts = async () => {
        try {
            setLoading(true);
            const accounts = await bankAccountService.getBankAccounts();
            setBankAccounts(accounts);
        } catch (error) {
            console.error("Failed to fetch bank accounts:", error);
            toast({
                title: "Error",
                description: "Failed to fetch bank accounts",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const fetchBanks = async () => {
        try {
            const banksData = await bankAccountService.getBanks();
            setBanks(banksData);
        } catch (error) {
            console.error("Failed to fetch banks:", error);
        }
    };

    // Handlers
    const handleSelectBank = (bank) => {
        setSelectedBank(bank);
        setBankSearchQuery("");
    };

    const handleAdd = async () => {
        if (!selectedBank || !accountNumber.trim() || !accountHolderName.trim()) {
            toast({
                title: "Validation Error",
                description: "Please fill in all fields",
                variant: "destructive",
            });
            return;
        }

        try {
            setProcessing(true);
            const accountData = {
                bankName: selectedBank.name,
                accountNumber: accountNumber.trim(),
                accountHolderName: accountHolderName.trim(),
                branch: selectedBank.shortName,
                logoUrl: selectedBank.logo,
                isDefault: bankAccounts.length === 0, // First account is default
            };

            await bankAccountService.createBankAccount(accountData);
            await fetchBankAccounts();
            handleCloseAddModal();

            toast({
                title: "Success!",
                description: "Bank account added successfully",
                variant: "success",
            });
        } catch (error) {
            toast({
                title: "Failed to add bank account",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setProcessing(false);
        }
    };

    const handleEdit = async () => {
        if (!selectedBank || !accountNumber.trim() || !accountHolderName.trim()) {
            toast({
                title: "Validation Error",
                description: "Please fill in all fields",
                variant: "destructive",
            });
            return;
        }

        try {
            setProcessing(true);
            const accountData = {
                bankName: selectedBank.name,
                accountNumber: accountNumber.trim(),
                accountHolderName: accountHolderName.trim(),
                branch: selectedBank.shortName,
                logoUrl: selectedBank.logo,
                isDefault: editingAccount.isDefault,
            };

            await bankAccountService.updateBankAccount(editingAccount.id, accountData);
            await fetchBankAccounts();
            handleCloseEditModal();

            toast({
                title: "Success!",
                description: "Bank account updated successfully",
                variant: "success",
            });
        } catch (error) {
            toast({
                title: "Failed to update bank account",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setProcessing(false);
        }
    };

    const handleDelete = async () => {
        if (!deletingAccount) return;

        try {
            setProcessing(true);
            await bankAccountService.deleteBankAccount(deletingAccount.id);
            await fetchBankAccounts();
            handleCloseDeleteModal();

            toast({
                title: "Success!",
                description: "Bank account deleted successfully",
                variant: "success",
            });
        } catch (error) {
            toast({
                title: "Failed to delete bank account",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setProcessing(false);
        }
    };

    const handleOpenAddModal = () => {
        setShowAddModal(true);
    };

    const handleCloseAddModal = () => {
        setShowAddModal(false);
        setSelectedBank(null);
        setAccountNumber("");
        setAccountHolderName("");
        setBankSearchQuery("");
    };

    const handleOpenEditModal = (account) => {
        setEditingAccount(account);
        // Find and set the bank from the banks list
        const bank = banks.find(
            (b) =>
                b.shortName.toLowerCase() === account.branch.toLowerCase() ||
                b.code.toLowerCase() === account.branch.toLowerCase()
        );
        setSelectedBank(bank || null);
        setAccountNumber(account.accountNumber);
        setAccountHolderName(account.accountHolderName);
        setShowEditModal(true);
    };

    const handleCloseEditModal = () => {
        setShowEditModal(false);
        setEditingAccount(null);
        setSelectedBank(null);
        setAccountNumber("");
        setAccountHolderName("");
        setBankSearchQuery("");
    };

    const handleOpenDeleteModal = (account) => {
        setDeletingAccount(account);
        setShowDeleteModal(true);
    };

    const handleCloseDeleteModal = () => {
        setShowDeleteModal(false);
        setDeletingAccount(null);
    };

    // Filtered banks for search
    const filteredBanks = banks.filter(
        (bank) =>
            bank.name.toLowerCase().includes(bankSearchQuery.toLowerCase()) ||
            bank.shortName.toLowerCase().includes(bankSearchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
                <ActivityIndicator size="large" color="#084F8C" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={styles.backButton}
                    >
                        <Icon name="arrow-back" size={24} color="#084F8C" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Bank Accounts</Text>
                    <View style={{ width: 24 }} />
                </View>
                <TouchableOpacity style={styles.addButton} onPress={handleOpenAddModal}>
                    <Icon name="add" size={20} color="#FFFFFF" />
                    <Text style={styles.addButtonText}>Add</Text>
                </TouchableOpacity>
            </View>

            {/* List */}
            <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {bankAccounts.length > 0 ? (
                    bankAccounts.map((account, index) => (
                        <View key={index} style={styles.accountCard}>
                            {account.logoUrl && (
                                <Image
                                    source={{ uri: account.logoUrl }}
                                    style={styles.bankLogo}
                                />
                            )}
                            <View style={styles.accountInfo}>
                                <Text style={styles.bankName}>
                                    {account.branch} - {account.bankName}
                                </Text>
                                <Text style={styles.accountNumber}>{account.accountNumber}</Text>
                                <Text style={styles.accountHolder}>{account.accountHolderName}</Text>
                                {account.isDefault && (
                                    <View style={styles.defaultBadge}>
                                        <Text style={styles.defaultText}>⭐ Default</Text>
                                    </View>
                                )}
                            </View>
                            <View style={styles.actionButtons}>
                                <TouchableOpacity
                                    style={styles.editButton}
                                    onPress={() => handleOpenEditModal(account)}
                                >
                                    <Icon name="edit" size={20} color="#FFFFFF" />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.deleteButton}
                                    onPress={() => handleOpenDeleteModal(account)}
                                >
                                    <Icon name="delete" size={20} color="#FFFFFF" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))
                ) : (
                    <View style={styles.emptyContainer}>
                        <Icon name="account-balance" size={64} color="#CBD5E1" />
                        <Text style={styles.emptyText}>No bank accounts yet{"\n"}Add one to get started!</Text>
                    </View>
                )}
            </ScrollView>

            {/* Add Modal */}
            <Modal
                visible={showAddModal}
                animationType="slide"
                transparent={true}
                onRequestClose={handleCloseAddModal}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Add Bank Account</Text>
                            <TouchableOpacity onPress={handleCloseAddModal}>
                                <Icon name="close" size={26} color="#0F172A" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                            <Text style={styles.inputLabel}>Select Bank</Text>
                            <View style={styles.bankSelectorContainer}>
                                <TextInput
                                    style={styles.searchInput}
                                    placeholder="Search bank..."
                                    value={bankSearchQuery}
                                    onChangeText={setBankSearchQuery}
                                />
                                <ScrollView style={{ maxHeight: 220 }} showsVerticalScrollIndicator={false} nestedScrollEnabled={true}>
                                    {filteredBanks.map((bank) => (
                                        <TouchableOpacity
                                            key={bank.id}
                                            style={[
                                                styles.bankItem,
                                                selectedBank?.id === bank.id && styles.bankItemSelected,
                                            ]}
                                            onPress={() => handleSelectBank(bank)}
                                        >
                                            <Image source={{ uri: bank.logo }} style={styles.bankItemLogo} />
                                            <View style={styles.bankItemInfo}>
                                                <Text style={styles.bankShortName}>{bank.shortName}</Text>
                                                <Text style={styles.bankFullName} numberOfLines={1}>
                                                    {bank.name}
                                                </Text>
                                            </View>
                                            {selectedBank?.id === bank.id && (
                                                <View style={styles.checkmark}>
                                                    <Text style={styles.checkmarkText}>✓</Text>
                                                </View>
                                            )}
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </View>

                            <Text style={styles.inputLabel}>Account Number</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter account number"
                                value={accountNumber}
                                onChangeText={setAccountNumber}
                                keyboardType="numeric"
                            />

                            <Text style={styles.inputLabel}>Account Holder Name</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter account holder name"
                                value={accountHolderName}
                                onChangeText={setAccountHolderName}
                            />
                        </ScrollView>

                        <View style={styles.modalFooter}>
                            <TouchableOpacity
                                style={[styles.button, styles.cancelButton]}
                                onPress={handleCloseAddModal}
                            >
                                <Text style={[styles.buttonText, { color: "#64748B" }]}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.button, styles.confirmButton]}
                                onPress={handleAdd}
                                disabled={processing}
                            >
                                {processing ? (
                                    <ActivityIndicator color="#FFFFFF" />
                                ) : (
                                    <Text style={[styles.buttonText, { color: "#FFFFFF" }]}>Add</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Edit Modal */}
            <Modal
                visible={showEditModal}
                animationType="slide"
                transparent={true}
                onRequestClose={handleCloseEditModal}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Edit Bank Account</Text>
                            <TouchableOpacity onPress={handleCloseEditModal}>
                                <Icon name="close" size={26} color="#0F172A" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                            <Text style={styles.inputLabel}>Select Bank</Text>
                            <View style={styles.bankSelectorContainer}>
                                <TextInput
                                    style={styles.searchInput}
                                    placeholder="Search bank..."
                                    value={bankSearchQuery}
                                    onChangeText={setBankSearchQuery}
                                />
                                <ScrollView style={{ maxHeight: 220 }} showsVerticalScrollIndicator={false} nestedScrollEnabled={true}>
                                    {filteredBanks.map((bank) => (
                                        <TouchableOpacity
                                            key={bank.id}
                                            style={[
                                                styles.bankItem,
                                                selectedBank?.id === bank.id && styles.bankItemSelected,
                                            ]}
                                            onPress={() => handleSelectBank(bank)}
                                        >
                                            <Image source={{ uri: bank.logo }} style={styles.bankItemLogo} />
                                            <View style={styles.bankItemInfo}>
                                                <Text style={styles.bankShortName}>{bank.shortName}</Text>
                                                <Text style={styles.bankFullName} numberOfLines={1}>
                                                    {bank.name}
                                                </Text>
                                            </View>
                                            {selectedBank?.id === bank.id && (
                                                <View style={styles.checkmark}>
                                                    <Text style={styles.checkmarkText}>✓</Text>
                                                </View>
                                            )}
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </View>

                            <Text style={styles.inputLabel}>Account Number</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter account number"
                                value={accountNumber}
                                onChangeText={setAccountNumber}
                                keyboardType="numeric"
                            />

                            <Text style={styles.inputLabel}>Account Holder Name</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter account holder name"
                                value={accountHolderName}
                                onChangeText={setAccountHolderName}
                            />
                        </ScrollView>

                        <View style={styles.modalFooter}>
                            <TouchableOpacity
                                style={[styles.button, styles.cancelButton]}
                                onPress={handleCloseEditModal}
                            >
                                <Text style={[styles.buttonText, { color: "#64748B" }]}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.button, styles.confirmButton]}
                                onPress={handleEdit}
                                disabled={processing}
                            >
                                {processing ? (
                                    <ActivityIndicator color="#FFFFFF" />
                                ) : (
                                    <Text style={[styles.buttonText, { color: "#FFFFFF" }]}>Update</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                visible={showDeleteModal}
                animationType="fade"
                transparent={true}
                onRequestClose={handleCloseDeleteModal}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.deleteModalContent}>
                        <View style={styles.deleteModalHeader}>
                            <Text style={styles.modalTitle}>Delete Bank Account</Text>
                            <TouchableOpacity onPress={handleCloseDeleteModal}>
                                <Icon name="close" size={24} color="#0F172A" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.deleteModalBody}>
                            <Icon name="warning" size={48} color="#EF4444" style={{ marginBottom: 12 }} />
                            <Text style={{ fontSize: 15, color: "#475569", textAlign: "center", marginBottom: 16 }}>
                                Are you sure you want to delete this bank account?
                            </Text>
                            {deletingAccount && (
                                <View style={{ alignItems: "center", backgroundColor: "#F8FAFC", padding: 12, borderRadius: 12, width: "100%" }}>
                                    <Text style={{ fontWeight: "700", color: "#084F8C", fontSize: 15 }}>
                                        {deletingAccount.branch} - {deletingAccount.bankName}
                                    </Text>
                                    <Text style={{ color: "#64748B", marginTop: 4, fontSize: 13 }}>
                                        {deletingAccount.accountNumber}
                                    </Text>
                                </View>
                            )}
                        </View>

                        <View style={styles.deleteModalFooter}>
                            <TouchableOpacity
                                style={[styles.button, styles.cancelButton]}
                                onPress={handleCloseDeleteModal}
                            >
                                <Text style={[styles.buttonText, { color: "#64748B" }]}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.button, styles.confirmButton, styles.deleteConfirmButton]}
                                onPress={handleDelete}
                                disabled={processing}
                            >
                                {processing ? (
                                    <ActivityIndicator color="#FFFFFF" />
                                ) : (
                                    <Text style={[styles.buttonText, { color: "#FFFFFF" }]}>Delete</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}
