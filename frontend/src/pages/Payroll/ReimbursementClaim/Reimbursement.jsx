import React, { useEffect, useState } from 'react'
import ReimbursementClaim from './ReimbursementClaim'
import ReimbursementPolicies from './ReimbursementPolicies'
import useReimbursement from '../../../Hooks/useReimbursement'

const Reimbursement = ({ currentPayslip }) => {
    const { getClaims } = useReimbursement();
    const [claims, setClaims] = useState([]);
    console.log(currentPayslip);

    useEffect(() => {
        fetchClaims();
    }, []);

    const fetchClaims = async () => {
        try {
            const data = await getClaims();
            const list = Array.isArray(data) ? data : data?.data || [];
            setClaims(list);
        } catch (error) {
            console.error("Error fetching claims:", error);
        }
    };
    return (
        <div>
            <ReimbursementClaim
                claims={claims}
                currentpayslip={currentPayslip}
                getClaims={fetchClaims}
                onRefresh={fetchClaims}
            />
            <ReimbursementPolicies />
        </div>
    )
}

export default Reimbursement