-- CreateEnum
CREATE TYPE "PaymentVerificationStatus" AS ENUM ('PENDING_PROOF', 'PROOF_UPLOADED', 'VERIFIED', 'REJECTED');

-- AlterTable
ALTER TABLE "platform_settings" ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "transactions" ADD COLUMN     "payment_proof_uploaded_at" TIMESTAMP(3),
ADD COLUMN     "payment_proof_url" TEXT,
ADD COLUMN     "verification_notes" TEXT,
ADD COLUMN     "verification_status" "PaymentVerificationStatus",
ADD COLUMN     "verified_at" TIMESTAMP(3),
ADD COLUMN     "verified_by" UUID;
