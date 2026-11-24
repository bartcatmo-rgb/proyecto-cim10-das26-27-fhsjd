using System;
using System.Collections.Generic;
using System.Drawing;
using System.Windows.Forms;
using System.Diagnostics;
using System.IO;
using System.IO.Compression;
using System.Net;
using System.Net.Sockets;
using System.Security;
using System.Text.RegularExpressions;
using System.Threading;
using System.Runtime.InteropServices;

namespace AulaCIM10Launcher
{
    public class MainForm : Form
    {
        private RadioButton rbLocal;
        private RadioButton rbRemote;
        private TextBox txtRemoteUrl;
        private Button btnStart;
        private Button btnStop;
        private Button btnOpenBrowser;
        private Button btnInstallGit;
        private Label lblStatus;
        private Label lblLanUrl;
        private Button btnCopyLan;
        private Label lblDisplayInfo;
        private Button btnDisplayModes;
        private Process serverProcess = null;
        private int currentPort = 3000;
        private string lanIp = "127.0.0.1";
        private string configPath;
        private string currentRepoUrl = "https://github.com/bartcatmo-rgb/proyecto-cim10-das26-27-fhsjd.git";
        private int screenWidth = 1920;
        private int screenHeight = 1080;
        private int dpiScalePercent = 100;

        public MainForm()
        {
            this.Text = "AulaCIM-10 · FHSJD (DAS 26/27) - Lanzador Oficial";
            this.Size = new Size(620, 610);
            this.FormBorderStyle = FormBorderStyle.FixedDialog;
            this.MaximizeBox = false;
            this.StartPosition = FormStartPosition.CenterScreen;
            this.BackColor = Color.FromArgb(248, 250, 252);
            this.Font = new Font("Segoe UI", 9.5f, FontStyle.Regular);

            configPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "launcher.config.json");

            DetectDisplayAndDpi();
            InitializeComponents();
            DetectLanIp();
            LoadConfig();

            this.FormClosing += new FormClosingEventHandler(MainForm_FormClosing);
        }

        private void DetectDisplayAndDpi()
        {
            try
            {
                Rectangle bounds = Screen.PrimaryScreen.Bounds;
                screenWidth = bounds.Width;
                screenHeight = bounds.Height;

                using (Graphics g = this.CreateGraphics())
                {
                    dpiScalePercent = (int)Math.Round((g.DpiX / 96.0f) * 100);
                }
            }
            catch
            {
                screenWidth = 1920;
                screenHeight = 1080;
                dpiScalePercent = 100;
            }
        }

        private void InitializeComponents()
        {
            // Header Panel
            Panel pnlHeader = new Panel();
            pnlHeader.Dock = DockStyle.Top;
            pnlHeader.Height = 85;
            pnlHeader.BackColor = Color.FromArgb(227, 6, 19); // Institutional SJD Red

            Label lblTitle = new Label();
            lblTitle.Text = "Campus Docent Sant Joan de Déu";
            lblTitle.Font = new Font("Segoe UI", 12f, FontStyle.Bold);
            lblTitle.ForeColor = Color.White;
            lblTitle.Location = new Point(20, 15);
            lblTitle.AutoSize = true;

            Label lblSubtitle = new Label();
            lblSubtitle.Text = "AulaCIM-10 · FHSJD (DAS 26/27) · Selector y Lanzador Oficial";
            lblSubtitle.Font = new Font("Segoe UI", 9.5f, FontStyle.Regular);
            lblSubtitle.ForeColor = Color.FromArgb(254, 242, 242);
            lblSubtitle.Location = new Point(20, 42);
            lblSubtitle.AutoSize = true;

            pnlHeader.Controls.Add(lblTitle);
            pnlHeader.Controls.Add(lblSubtitle);
            this.Controls.Add(pnlHeader);

            // GroupBox Mode
            GroupBox grpMode = new GroupBox();
            grpMode.Text = "  Modo de Operación  ";
            grpMode.Location = new Point(20, 95);
            grpMode.Size = new Size(565, 175);
            grpMode.Font = new Font("Segoe UI", 9.5f, FontStyle.Bold);
            grpMode.ForeColor = Color.FromArgb(17, 24, 39);

            rbRemote = new RadioButton();
            rbRemote.Text = "Modo 1: Acceso Directo Vercel (Producción Nube) [Recomendado]";
            rbRemote.Location = new Point(20, 25);
            rbRemote.Size = new Size(520, 25);
            rbRemote.Checked = true;
            rbRemote.Font = new Font("Segoe UI", 9.5f, FontStyle.Bold);
            rbRemote.ForeColor = Color.FromArgb(17, 24, 39);
            rbRemote.CheckedChanged += new EventHandler(RbMode_CheckedChanged);

            txtRemoteUrl = new TextBox();
            txtRemoteUrl.Location = new Point(42, 52);
            txtRemoteUrl.Size = new Size(495, 24);
            txtRemoteUrl.Font = new Font("Segoe UI", 9.0f, FontStyle.Regular);
            txtRemoteUrl.Text = "https://proyecto-cim10-das26-27-fhsjd.vercel.app";

            rbLocal = new RadioButton();
            rbLocal.Text = "Modo 2: Aula Local / Offline (SQLite WAL en este PC)";
            rbLocal.Location = new Point(20, 85);
            rbLocal.Size = new Size(520, 25);
            rbLocal.Font = new Font("Segoe UI", 9.5f, FontStyle.Bold);
            rbLocal.ForeColor = Color.FromArgb(17, 24, 39);
            rbLocal.CheckedChanged += new EventHandler(RbMode_CheckedChanged);

            Label lblLocalDesc = new Label();
            lblLocalDesc.Text = "Lanza el servidor en 0.0.0.0. Los alumnos acceden vía Wi-Fi/LAN del aula sin depender de internet.";
            lblLocalDesc.Location = new Point(42, 110);
            lblLocalDesc.Size = new Size(495, 30);
            lblLocalDesc.Font = new Font("Segoe UI", 8.5f, FontStyle.Regular);
            lblLocalDesc.ForeColor = Color.FromArgb(75, 85, 99);

            btnInstallGit = new Button();
            btnInstallGit.Text = "Instalar / Actualizar desde GitHub...";
            btnInstallGit.Location = new Point(42, 142);
            btnInstallGit.Size = new Size(250, 26);
            btnInstallGit.Font = new Font("Segoe UI", 8.5f, FontStyle.Regular);
            btnInstallGit.BackColor = Color.FromArgb(241, 245, 249);
            btnInstallGit.FlatStyle = FlatStyle.Flat;
            btnInstallGit.Click += new EventHandler(BtnInstallGit_Click);

            grpMode.Controls.Add(rbRemote);
            grpMode.Controls.Add(txtRemoteUrl);
            grpMode.Controls.Add(rbLocal);
            grpMode.Controls.Add(lblLocalDesc);
            grpMode.Controls.Add(btnInstallGit);
            this.Controls.Add(grpMode);

            // Server, Network & Display Status Panel
            GroupBox grpStatus = new GroupBox();
            grpStatus.Text = "  Estado de Conectividad, Pantalla y Red  ";
            grpStatus.Location = new Point(20, 280);
            grpStatus.Size = new Size(565, 160);
            grpStatus.Font = new Font("Segoe UI", 9.5f, FontStyle.Bold);
            grpStatus.ForeColor = Color.FromArgb(17, 24, 39);

            lblStatus = new Label();
            lblStatus.Text = "Modo Web: Listo para abrir versión desplegada.";
            lblStatus.Location = new Point(20, 24);
            lblStatus.Size = new Size(520, 20);
            lblStatus.Font = new Font("Segoe UI", 9.0f, FontStyle.Regular);
            lblStatus.ForeColor = Color.FromArgb(75, 85, 99);

            lblLanUrl = new Label();
            lblLanUrl.Text = "Destino Web: https://proyecto-cim10-das26-27-fhsjd.vercel.app";
            lblLanUrl.Location = new Point(20, 48);
            lblLanUrl.Size = new Size(410, 22);
            lblLanUrl.Font = new Font("Segoe UI", 9.0f, FontStyle.Bold);
            lblLanUrl.ForeColor = Color.FromArgb(0, 119, 182); // Docent Blue

            btnCopyLan = new Button();
            btnCopyLan.Text = "Copiar URL";
            btnCopyLan.Location = new Point(440, 44);
            btnCopyLan.Size = new Size(105, 28);
            btnCopyLan.Font = new Font("Segoe UI", 8.5f, FontStyle.Bold);
            btnCopyLan.BackColor = Color.FromArgb(241, 245, 249);
            btnCopyLan.FlatStyle = FlatStyle.Flat;
            btnCopyLan.Enabled = false;
            btnCopyLan.FlatAppearance.BorderColor = Color.FromArgb(203, 213, 225);
            btnCopyLan.Click += new EventHandler(BtnCopyLan_Click);

            // Display resolution and DPI badge
            lblDisplayInfo = new Label();
            lblDisplayInfo.Text = string.Format("Pantalla: {0}x{1} @ {2}% DPI (Escalado adaptativo activo)", screenWidth, screenHeight, dpiScalePercent);
            lblDisplayInfo.Location = new Point(20, 78);
            lblDisplayInfo.Size = new Size(410, 22);
            lblDisplayInfo.Font = new Font("Segoe UI", 8.5f, FontStyle.Regular);
            lblDisplayInfo.ForeColor = Color.FromArgb(30, 41, 59);

            btnDisplayModes = new Button();
            btnDisplayModes.Text = "Modos Pantalla";
            btnDisplayModes.Location = new Point(440, 74);
            btnDisplayModes.Size = new Size(105, 28);
            btnDisplayModes.Font = new Font("Segoe UI", 8.5f, FontStyle.Bold);
            btnDisplayModes.BackColor = Color.FromArgb(241, 245, 249);
            btnDisplayModes.FlatStyle = FlatStyle.Flat;
            btnDisplayModes.FlatAppearance.BorderColor = Color.FromArgb(203, 213, 225);
            btnDisplayModes.Click += new EventHandler(BtnDisplayModes_Click);

            Label lblFootnote = new Label();
            lblFootnote.Text = "Pizarra Proyectable en /pizarra · Adaptación CSS 100dvh · Blindaje CISO activo";
            lblFootnote.Location = new Point(20, 115);
            lblFootnote.Size = new Size(520, 32);
            lblFootnote.Font = new Font("Segoe UI", 8.0f, FontStyle.Italic);
            lblFootnote.ForeColor = Color.FromArgb(100, 116, 139);

            grpStatus.Controls.Add(lblStatus);
            grpStatus.Controls.Add(lblLanUrl);
            grpStatus.Controls.Add(btnCopyLan);
            grpStatus.Controls.Add(lblDisplayInfo);
            grpStatus.Controls.Add(btnDisplayModes);
            grpStatus.Controls.Add(lblFootnote);
            this.Controls.Add(grpStatus);

            // Action Buttons
            btnStart = new Button();
            btnStart.Text = "Abrir en Vercel";
            btnStart.Location = new Point(20, 455);
            btnStart.Size = new Size(170, 44);
            btnStart.BackColor = Color.FromArgb(227, 6, 19);
            btnStart.ForeColor = Color.White;
            btnStart.Font = new Font("Segoe UI", 10f, FontStyle.Bold);
            btnStart.FlatStyle = FlatStyle.Flat;
            btnStart.Cursor = Cursors.Hand;
            btnStart.FlatAppearance.BorderSize = 0;
            btnStart.Click += new EventHandler(BtnStart_Click);

            btnStop = new Button();
            btnStop.Text = "Detener Servidor";
            btnStop.Location = new Point(200, 455);
            btnStop.Size = new Size(150, 44);
            btnStop.BackColor = Color.FromArgb(226, 232, 240);
            btnStop.ForeColor = Color.FromArgb(71, 85, 105);
            btnStop.Font = new Font("Segoe UI", 9.5f, FontStyle.Bold);
            btnStop.FlatStyle = FlatStyle.Flat;
            btnStop.Enabled = false;
            btnStop.FlatAppearance.BorderSize = 0;
            btnStop.Click += new EventHandler(BtnStop_Click);

            btnOpenBrowser = new Button();
            btnOpenBrowser.Text = "Abrir Navegador";
            btnOpenBrowser.Location = new Point(360, 455);
            btnOpenBrowser.Size = new Size(225, 44);
            btnOpenBrowser.BackColor = Color.FromArgb(0, 119, 182);
            btnOpenBrowser.ForeColor = Color.White;
            btnOpenBrowser.Font = new Font("Segoe UI", 9.5f, FontStyle.Bold);
            btnOpenBrowser.FlatStyle = FlatStyle.Flat;
            btnOpenBrowser.Cursor = Cursors.Hand;
            btnOpenBrowser.FlatAppearance.BorderSize = 0;
            btnOpenBrowser.Click += new EventHandler(BtnOpenBrowser_Click);

            this.Controls.Add(btnStart);
            this.Controls.Add(btnStop);
            this.Controls.Add(btnOpenBrowser);
        }

        private void RbMode_CheckedChanged(object sender, EventArgs e)
        {
            ToggleMode();
        }

        private void ToggleMode()
        {
            txtRemoteUrl.Enabled = rbRemote.Checked;
            if (rbRemote.Checked)
            {
                btnStart.Text = "Abrir en Vercel";
                lblStatus.Text = "Modo Web: Listo para abrir versión desplegada.";
                lblLanUrl.Text = "Destino Web: " + txtRemoteUrl.Text;
                btnCopyLan.Enabled = false;
            }
            else
            {
                btnStart.Text = "Iniciar Aula Local";
                lblStatus.Text = serverProcess != null && !serverProcess.HasExited ? "Servidor activo en puerto " + currentPort : "Estado: Servidor detenido.";
                if (serverProcess != null && !serverProcess.HasExited)
                {
                    lblLanUrl.Text = "URL Alumnos (LAN): http://" + lanIp + ":" + currentPort;
                    btnCopyLan.Enabled = true;
                }
                else
                {
                    lblLanUrl.Text = "URL Alumnos (LAN): Pendiente de iniciar servidor...";
                    btnCopyLan.Enabled = false;
                }
            }
        }

        private bool ValidateUrl(string url)
        {
            if (string.IsNullOrEmpty(url)) return false;
            Uri uriResult;
            bool result = Uri.TryCreate(url, UriKind.Absolute, out uriResult)
                && (uriResult.Scheme == Uri.UriSchemeHttp || uriResult.Scheme == Uri.UriSchemeHttps);
            return result;
        }

        private void DetectLanIp()
        {
            try
            {
                using (Socket socket = new Socket(AddressFamily.InterNetwork, SocketType.Dgram, 0))
                {
                    socket.Connect("8.8.8.8", 65530);
                    IPEndPoint endPoint = socket.LocalEndPoint as IPEndPoint;
                    if (endPoint != null)
                    {
                        lanIp = endPoint.Address.ToString();
                        return;
                    }
                }
            }
            catch
            {
                try
                {
                    string host = Dns.GetHostName();
                    IPHostEntry entry = Dns.GetHostEntry(host);
                    foreach (IPAddress ip in entry.AddressList)
                    {
                        if (ip.AddressFamily == AddressFamily.InterNetwork && !IPAddress.IsLoopback(ip))
                        {
                            lanIp = ip.ToString();
                            break;
                        }
                    }
                }
                catch { lanIp = "127.0.0.1"; }
            }
        }

        private int FindFreePort(int startPort)
        {
            for (int p = startPort; p <= 3099; p++)
            {
                try
                {
                    TcpListener l = new TcpListener(IPAddress.Any, p);
                    l.Start();
                    l.Stop();
                    return p;
                }
                catch { }
            }
            return startPort;
        }

        private void BtnStart_Click(object sender, EventArgs e)
        {
            if (rbRemote.Checked)
            {
                string targetUrl = txtRemoteUrl.Text.Trim();
                if (!ValidateUrl(targetUrl))
                {
                    MessageBox.Show("Por favor, introduce una URL válida (ej. https://proyecto-cim10-das26-27-fhsjd.vercel.app)", "URL Inválida", MessageBoxButtons.OK, MessageBoxIcon.Warning);
                    return;
                }
                SaveConfig();
                try
                {
                    Process.Start(new ProcessStartInfo(targetUrl) { UseShellExecute = true });
                }
                catch (Exception ex)
                {
                    MessageBox.Show("Error al abrir navegador: " + ex.Message, "Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
                }
            }
            else
            {
                StartServer();
            }
        }

        private void StartServer()
        {
            if (serverProcess != null && !serverProcess.HasExited)
            {
                MessageBox.Show("El servidor ya está en ejecución.", "Información", MessageBoxButtons.OK, MessageBoxIcon.Information);
                return;
            }

            string baseDir = AppDomain.CurrentDomain.BaseDirectory;
            string nodeExe = Path.Combine(baseDir, "runtime", "node", "node.exe");
            bool isNodePortable = File.Exists(nodeExe);
            if (!isNodePortable)
            {
                nodeExe = "node";
            }

            string nextBin = Path.Combine(baseDir, "node_modules", "next", "dist", "bin", "next");
            string serverJs = Path.Combine(baseDir, ".next", "standalone", "server.js");

            bool hasNextBin = File.Exists(nextBin);
            bool hasStandalone = File.Exists(serverJs);

            if (!hasNextBin && !hasStandalone)
            {
                MessageBox.Show("No se encontró la aplicación compilada (ni .next\\standalone\\server.js ni node_modules\\next).\nPor favor, ejecuta la instalación o asegúrate de que el paquete está completo.", "Faltan Archivos", MessageBoxButtons.OK, MessageBoxIcon.Error);
                return;
            }

            currentPort = FindFreePort(3000);

            // Create data dir
            string dataDir = Path.Combine(baseDir, "data");
            if (!Directory.Exists(dataDir)) Directory.CreateDirectory(dataDir);

            // Generate session secret if missing
            string secretFile = Path.Combine(baseDir, ".session_secret");
            if (!File.Exists(secretFile))
            {
                byte[] secretBytes = new byte[64];
                using (var rng = new System.Security.Cryptography.RNGCryptoServiceProvider())
                {
                    rng.GetBytes(secretBytes);
                }
                File.WriteAllText(secretFile, BitConverter.ToString(secretBytes).Replace("-", "").ToLowerInvariant());
            }

            ProcessStartInfo psi = new ProcessStartInfo();
            psi.FileName = nodeExe;
            if (hasStandalone)
            {
                psi.Arguments = string.Format("\"{0}\"", serverJs);
            }
            else
            {
                psi.Arguments = string.Format("\"{0}\" start -H 0.0.0.0 -p {1}", nextBin, currentPort);
            }

            psi.WorkingDirectory = baseDir;
            psi.UseShellExecute = false;
            psi.CreateNoWindow = true;
            psi.EnvironmentVariables["PORT"] = currentPort.ToString();
            psi.EnvironmentVariables["HOSTNAME"] = "0.0.0.0";
            psi.EnvironmentVariables["NODE_ENV"] = "production";

            try
            {
                serverProcess = Process.Start(psi);
                btnStart.Enabled = false;
                btnStop.Enabled = true;
                btnCopyLan.Enabled = true;

                lblStatus.Text = "Servidor activo en puerto " + currentPort + " (Escuchando en 0.0.0.0)";
                lblStatus.ForeColor = Color.FromArgb(22, 163, 74);
                lblLanUrl.Text = "URL Alumnos (LAN): http://" + lanIp + ":" + currentPort;

                // Wait 2 seconds and open browser
                ThreadPool.QueueUserWorkItem(delegate
                {
                    Thread.Sleep(2000);
                    try
                    {
                        Process.Start(new ProcessStartInfo("http://localhost:" + currentPort) { UseShellExecute = true });
                    }
                    catch { }
                });
            }
            catch (Exception ex)
            {
                MessageBox.Show("Error al iniciar servidor: " + ex.Message, "Error de Inicio", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }

        private void BtnStop_Click(object sender, EventArgs e)
        {
            StopServer();
        }

        private void StopServer()
        {
            if (serverProcess != null && !serverProcess.HasExited)
            {
                try
                {
                    serverProcess.Kill();
                    serverProcess.WaitForExit(3000);
                }
                catch { }
                serverProcess = null;
            }

            btnStart.Enabled = true;
            btnStop.Enabled = false;
            btnCopyLan.Enabled = false;

            lblStatus.Text = "Estado: Servidor detenido.";
            lblStatus.ForeColor = Color.FromArgb(75, 85, 99);
            lblLanUrl.Text = "URL Alumnos (LAN): Pendiente de iniciar servidor...";
        }

        private void BtnOpenBrowser_Click(object sender, EventArgs e)
        {
            string url = rbRemote.Checked ? txtRemoteUrl.Text.Trim() : ("http://localhost:" + currentPort);
            if (ValidateUrl(url))
            {
                try
                {
                    Process.Start(new ProcessStartInfo(url) { UseShellExecute = true });
                }
                catch (Exception ex)
                {
                    MessageBox.Show("Error al abrir navegador: " + ex.Message, "Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
                }
            }
            else
            {
                MessageBox.Show("URL no válida: " + url, "Error", MessageBoxButtons.OK, MessageBoxIcon.Warning);
            }
        }

        private void BtnCopyLan_Click(object sender, EventArgs e)
        {
            string url = "http://" + lanIp + ":" + currentPort;
            try
            {
                Clipboard.SetText(url);
                MessageBox.Show("URL de red local copiada al portapapeles:\n" + url + "\n\nComparte este enlace con los alumnos conectados a la misma Wi-Fi/red.", "URL Copiada", MessageBoxButtons.OK, MessageBoxIcon.Information);
            }
            catch (Exception ex)
            {
                MessageBox.Show("No se pudo copiar al portapapeles: " + ex.Message, "Aviso", MessageBoxButtons.OK, MessageBoxIcon.Warning);
            }
        }

        private void BtnDisplayModes_Click(object sender, EventArgs e)
        {
            using (DisplayModesDialog dlg = new DisplayModesDialog(screenWidth, screenHeight, dpiScalePercent))
            {
                dlg.ShowDialog(this);
            }
        }

        private void BtnInstallGit_Click(object sender, EventArgs e)
        {
            using (Form prompt = new Form())
            {
                prompt.Width = 520;
                prompt.Height = 220;
                prompt.FormBorderStyle = FormBorderStyle.FixedDialog;
                prompt.Text = "Instalar / Actualizar desde GitHub";
                prompt.StartPosition = FormStartPosition.CenterParent;
                prompt.MaximizeBox = false;

                Label textLabel = new Label() { Left = 20, Top = 15, Width = 460, Text = "Introduce la URL del repositorio GitHub de AulaCIM-10:" };
                TextBox textBox = new TextBox() { Left = 20, Top = 45, Width = 460, Text = currentRepoUrl };
                Label noteLabel = new Label() { Left = 20, Top = 80, Width = 460, Height = 40, ForeColor = Color.FromArgb(100, 116, 139), Text = "Nota: Si Git está instalado se realizará git clone/pull seguro. De lo contrario, se descargará el ZIP oficial de la rama principal." };
                Button confirmation = new Button() { Text = "Descargar e Instalar", Left = 300, Width = 180, Top = 130, DialogResult = DialogResult.OK, BackColor = Color.FromArgb(227, 6, 19), ForeColor = Color.White, FlatStyle = FlatStyle.Flat };

                prompt.Controls.Add(textLabel);
                prompt.Controls.Add(textBox);
                prompt.Controls.Add(noteLabel);
                prompt.Controls.Add(confirmation);
                prompt.AcceptButton = confirmation;

                if (prompt.ShowDialog(this) == DialogResult.OK)
                {
                    string inputUrl = textBox.Text.Trim();
                    if (!ValidateUrl(inputUrl))
                    {
                        MessageBox.Show("Por favor, introduce una URL de repositorio válida.", "URL Inválida", MessageBoxButtons.OK, MessageBoxIcon.Warning);
                        return;
                    }

                    currentRepoUrl = inputUrl;
                    SaveConfig();

                    lblStatus.Text = "Descargando e instalando repositorio oficial...";
                    lblStatus.ForeColor = Color.FromArgb(0, 119, 182);

                    ThreadPool.QueueUserWorkItem(delegate
                    {
                        try
                        {
                            string targetDir = AppDomain.CurrentDomain.BaseDirectory;
                            bool hasGit = false;
                            try
                            {
                                Process pGit = Process.Start(new ProcessStartInfo("git", "--version") { UseShellExecute = false, CreateNoWindow = true });
                                pGit.WaitForExit(3000);
                                hasGit = (pGit.ExitCode == 0);
                            }
                            catch { }

                            if (hasGit)
                            {
                                ProcessStartInfo psi = new ProcessStartInfo("git");
                                psi.UseShellExecute = false;
                                psi.CreateNoWindow = true;

                                if (Directory.Exists(Path.Combine(targetDir, ".git")))
                                {
                                    psi.Arguments = "pull origin main";
                                    psi.WorkingDirectory = targetDir;
                                }
                                else
                                {
                                    psi.Arguments = string.Format("clone {0} .", currentRepoUrl);
                                    psi.WorkingDirectory = targetDir;
                                }

                                Process proc = Process.Start(psi);
                                proc.WaitForExit(60000);
                            }
                            else
                            {
                                // Download ZIP fallback
                                string zipUrl = currentRepoUrl.TrimEnd('/') + "/archive/refs/heads/main.zip";
                                string tempZip = Path.Combine(Path.GetTempPath(), "aulacim_repo_" + Guid.NewGuid().ToString("N") + ".zip");
                                using (WebClient client = new WebClient())
                                {
                                    client.DownloadFile(zipUrl, tempZip);
                                }

                                // Extract safely avoiding Zip Slip
                                using (ZipArchive archive = ZipFile.OpenRead(tempZip))
                                {
                                    string fullDest = Path.GetFullPath(targetDir);
                                    foreach (ZipArchiveEntry entry in archive.Entries)
                                    {
                                        string relPath = entry.FullName;
                                        int slashIdx = relPath.IndexOf('/');
                                        if (slashIdx >= 0) relPath = relPath.Substring(slashIdx + 1);
                                        if (string.IsNullOrEmpty(relPath)) continue;

                                        string destFile = Path.GetFullPath(Path.Combine(fullDest, relPath));
                                        if (!destFile.StartsWith(fullDest, StringComparison.OrdinalIgnoreCase))
                                        {
                                            throw new SecurityException("Zip Slip detectado en entrada de archivo.");
                                        }

                                        if (entry.FullName.EndsWith("/"))
                                        {
                                            Directory.CreateDirectory(destFile);
                                        }
                                        else
                                        {
                                            Directory.CreateDirectory(Path.GetDirectoryName(destFile));
                                            entry.ExtractToFile(destFile, true);
                                        }
                                    }
                                }
                                try { File.Delete(tempZip); } catch { }
                            }

                            this.Invoke((MethodInvoker)delegate
                            {
                                lblStatus.Text = "Instalación/Actualización desde GitHub completada con éxito.";
                                lblStatus.ForeColor = Color.FromArgb(22, 163, 74);
                                MessageBox.Show("Repositorio instalado/actualizado correctamente en:\n" + targetDir, "AulaCIM-10", MessageBoxButtons.OK, MessageBoxIcon.Information);
                            });
                        }
                        catch (Exception ex)
                        {
                            this.Invoke((MethodInvoker)delegate
                            {
                                lblStatus.Text = "Error en la instalación desde GitHub: " + ex.Message;
                                lblStatus.ForeColor = Color.FromArgb(220, 38, 38);
                                MessageBox.Show("Error durante la instalación: " + ex.Message, "AulaCIM-10", MessageBoxButtons.OK, MessageBoxIcon.Error);
                            });
                        }
                    });
                }
            }
        }

        private void LoadConfig()
        {
            try
            {
                if (File.Exists(configPath))
                {
                    string json = File.ReadAllText(configPath);
                    Match mUrl = Regex.Match(json, "\"remoteUrl\"\\s*:\\s*\"([^\"]+)\"");
                    if (mUrl.Success) txtRemoteUrl.Text = mUrl.Groups[1].Value;

                    Match mRepo = Regex.Match(json, "\"repoUrl\"\\s*:\\s*\"([^\"]+)\"");
                    if (mRepo.Success) currentRepoUrl = mRepo.Groups[1].Value;

                    Match mMode = Regex.Match(json, "\"preferredMode\"\\s*:\\s*\"([^\"]+)\"");
                    if (mMode.Success && mMode.Groups[1].Value == "local")
                    {
                        rbLocal.Checked = true;
                    }
                    else
                    {
                        rbRemote.Checked = true;
                    }
                    ToggleMode();
                }
            }
            catch { }
        }

        private void SaveConfig()
        {
            try
            {
                string mode = rbRemote.Checked ? "remote" : "local";
                string json = string.Format("{{\n  \"remoteUrl\": \"{0}\",\n  \"preferredMode\": \"{1}\",\n  \"autoOpenBrowser\": true,\n  \"repoUrl\": \"{2}\"\n}}\n",
                    txtRemoteUrl.Text.Trim(), mode, currentRepoUrl.Trim());
                File.WriteAllText(configPath, json);
            }
            catch { }
        }

        private void MainForm_FormClosing(object sender, FormClosingEventArgs e)
        {
            StopServer();
        }

        [STAThread]
        public static void Main()
        {
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);
            Application.Run(new MainForm());
        }
    }

    /// <summary>
    /// Modal Dialog to safely query display modes and view DPI scaling
    /// </summary>
    public class DisplayModesDialog : Form
    {
        [StructLayout(LayoutKind.Sequential, CharSet = CharSet.Ansi)]
        public struct DEVMODE
        {
            [MarshalAs(UnmanagedType.ByValTStr, SizeConst = 32)]
            public string dmDeviceName;
            public short dmSpecVersion;
            public short dmDriverVersion;
            public short dmSize;
            public short dmDriverExtra;
            public int dmFields;
            public int dmPositionX;
            public int dmPositionY;
            public int dmDisplayOrientation;
            public int dmDisplayFixedOutput;
            public short dmColor;
            public short dmDuplex;
            public short dmYResolution;
            public short dmTTOption;
            public short dmCollate;
            [MarshalAs(UnmanagedType.ByValTStr, SizeConst = 32)]
            public string dmFormName;
            public short dmLogPixels;
            public short dmBitsPerPel;
            public int dmPelsWidth;
            public int dmPelsHeight;
            public int dmDisplayFlags;
            public int dmDisplayFrequency;
            public int dmICMMethod;
            public int dmICMIntent;
            public int dmMediaType;
            public int dmDitherType;
            public int dmReserved1;
            public int dmReserved2;
            public int dmPanningWidth;
            public int dmPanningHeight;
        }

        [DllImport("user32.dll")]
        public static extern bool EnumDisplaySettings(string deviceName, int modeNum, ref DEVMODE devMode);

        [DllImport("user32.dll")]
        public static extern int ChangeDisplaySettings(ref DEVMODE devMode, int flags);

        public const int CDS_TEST = 0x00000002;
        public const int DISP_CHANGE_SUCCESSFUL = 0;

        private ListView lstModes;
        private Label lblActiveMode;
        private Button btnTestMode;
        private Button btnClose;
        private List<DEVMODE> modesList = new List<DEVMODE>();

        public DisplayModesDialog(int currentW, int currentH, int dpi)
        {
            this.Text = "Consulta de Modos y Adaptación de Pantalla · AulaCIM-10";
            this.Size = new Size(580, 480);
            this.FormBorderStyle = FormBorderStyle.FixedDialog;
            this.MaximizeBox = false;
            this.MinimizeBox = false;
            this.StartPosition = FormStartPosition.CenterParent;
            this.BackColor = Color.FromArgb(248, 250, 252);
            this.Font = new Font("Segoe UI", 9.0f, FontStyle.Regular);

            // Banner
            Panel pnlBanner = new Panel();
            pnlBanner.Dock = DockStyle.Top;
            pnlBanner.Height = 70;
            pnlBanner.BackColor = Color.FromArgb(15, 23, 42); // Slate 900

            Label lblBannerTitle = new Label();
            lblBannerTitle.Text = "Adaptación Automática y Modos de Pantalla";
            lblBannerTitle.Font = new Font("Segoe UI", 11f, FontStyle.Bold);
            lblBannerTitle.ForeColor = Color.White;
            lblBannerTitle.Location = new Point(15, 12);
            lblBannerTitle.AutoSize = true;

            Label lblBannerSub = new Label();
            lblBannerSub.Text = "AulaCIM-10 escala fluidamente (100dvh, tipografía fluida y gráficos vectoriales SVG).";
            lblBannerSub.Font = new Font("Segoe UI", 8.5f, FontStyle.Regular);
            lblBannerSub.ForeColor = Color.FromArgb(203, 213, 225);
            lblBannerSub.Location = new Point(15, 36);
            lblBannerSub.AutoSize = true;

            pnlBanner.Controls.Add(lblBannerTitle);
            pnlBanner.Controls.Add(lblBannerSub);
            this.Controls.Add(pnlBanner);

            // Active resolution info
            lblActiveMode = new Label();
            lblActiveMode.Text = string.Format("✓ Resolución Activa: {0}x{1} px | Escala DPI: {2}% ({3})",
                currentW, currentH, dpi,
                dpi >= 150 ? "Alta densidad / 4K Aula" : (dpi > 100 ? "Escalado recomendado Windows" : "Estándar 100%"));
            lblActiveMode.Font = new Font("Segoe UI", 9.5f, FontStyle.Bold);
            lblActiveMode.ForeColor = Color.FromArgb(22, 101, 52); // Emerald 800
            lblActiveMode.BackColor = Color.FromArgb(240, 253, 244);
            lblActiveMode.BorderStyle = BorderStyle.FixedSingle;
            lblActiveMode.Location = new Point(15, 80);
            lblActiveMode.Size = new Size(535, 32);
            lblActiveMode.TextAlign = ContentAlignment.MiddleLeft;
            lblActiveMode.Padding = new Padding(8, 0, 0, 0);
            this.Controls.Add(lblActiveMode);

            // ListView with supported modes
            lstModes = new ListView();
            lstModes.Location = new Point(15, 120);
            lstModes.Size = new Size(535, 230);
            lstModes.View = View.Details;
            lstModes.FullRowSelect = true;
            lstModes.GridLines = true;
            lstModes.MultiSelect = false;
            lstModes.Columns.Add("Resolución (Ancho x Alto)", 180);
            lstModes.Columns.Add("Refresco (Hz)", 95);
            lstModes.Columns.Add("Profundidad Color", 110);
            lstModes.Columns.Add("Estado / Compatibilidad", 135);
            this.Controls.Add(lstModes);

            // Buttons
            btnTestMode = new Button();
            btnTestMode.Text = "Comprobar Modo Seguro (Sin alterar pantalla)";
            btnTestMode.Location = new Point(15, 365);
            btnTestMode.Size = new Size(300, 34);
            btnTestMode.Font = new Font("Segoe UI", 8.5f, FontStyle.Bold);
            btnTestMode.BackColor = Color.FromArgb(241, 245, 249);
            btnTestMode.FlatStyle = FlatStyle.Flat;
            btnTestMode.FlatAppearance.BorderColor = Color.FromArgb(203, 213, 225);
            btnTestMode.Click += new EventHandler(BtnTestMode_Click);
            this.Controls.Add(btnTestMode);

            btnClose = new Button();
            btnClose.Text = "Cerrar";
            btnClose.Location = new Point(440, 365);
            btnClose.Size = new Size(110, 34);
            btnClose.Font = new Font("Segoe UI", 9.0f, FontStyle.Bold);
            btnClose.BackColor = Color.FromArgb(227, 6, 19);
            btnClose.ForeColor = Color.White;
            btnClose.FlatStyle = FlatStyle.Flat;
            btnClose.FlatAppearance.BorderSize = 0;
            btnClose.Click += delegate { this.Close(); };
            this.Controls.Add(btnClose);

            Label lblSafeNotice = new Label();
            lblSafeNotice.Text = "Aviso: No es necesario cambiar la resolución del monitor; la aplicación web adapta todas sus vistas automáticamente.";
            lblSafeNotice.Location = new Point(15, 410);
            lblSafeNotice.Size = new Size(535, 25);
            lblSafeNotice.Font = new Font("Segoe UI", 8.0f, FontStyle.Italic);
            lblSafeNotice.ForeColor = Color.FromArgb(100, 116, 139);
            this.Controls.Add(lblSafeNotice);

            LoadDisplayModes(currentW, currentH);
        }

        private void LoadDisplayModes(int activeW, int activeH)
        {
            try
            {
                DEVMODE dm = new DEVMODE();
                dm.dmSize = (short)Marshal.SizeOf(typeof(DEVMODE));
                int modeNum = 0;
                HashSet<string> seen = new HashSet<string>();

                while (EnumDisplaySettings(null, modeNum, ref dm))
                {
                    string key = string.Format("{0}x{1}@{2}Hz-{3}bit", dm.dmPelsWidth, dm.dmPelsHeight, dm.dmDisplayFrequency, dm.dmBitsPerPel);
                    if (!seen.Contains(key) && dm.dmBitsPerPel >= 32)
                    {
                        seen.Add(key);
                        modesList.Add(dm);

                        ListViewItem item = new ListViewItem(string.Format("{0} x {1}", dm.dmPelsWidth, dm.dmPelsHeight));
                        item.SubItems.Add(dm.dmDisplayFrequency + " Hz");
                        item.SubItems.Add(dm.dmBitsPerPel + " bits (TrueColor)");

                        bool isActive = (dm.dmPelsWidth == activeW && dm.dmPelsHeight == activeH);
                        if (isActive)
                        {
                            item.SubItems.Add("ACTIVA AHORA");
                            item.BackColor = Color.FromArgb(236, 253, 245);
                            item.Font = new Font(lstModes.Font, FontStyle.Bold);
                        }
                        else
                        {
                            item.SubItems.Add("Compatible");
                        }

                        item.Tag = dm;
                        lstModes.Items.Add(item);
                    }
                    modeNum++;
                }
            }
            catch (Exception ex)
            {
                ListViewItem err = new ListViewItem("Error al consultar modos: " + ex.Message);
                lstModes.Items.Add(err);
            }
        }

        private void BtnTestMode_Click(object sender, EventArgs e)
        {
            if (lstModes.SelectedItems.Count == 0)
            {
                MessageBox.Show("Selecciona un modo de la lista para verificar su compatibilidad de hardware.", "Selección Requerida", MessageBoxButtons.OK, MessageBoxIcon.Information);
                return;
            }

            try
            {
                DEVMODE selectedMode = (DEVMODE)lstModes.SelectedItems[0].Tag;
                int res = ChangeDisplaySettings(ref selectedMode, CDS_TEST);

                if (res == DISP_CHANGE_SUCCESSFUL)
                {
                    MessageBox.Show(
                        string.Format("✓ La tarjeta gráfica y el monitor confirman compatibilidad completa con {0}x{1} @ {2}Hz.\n\nNota: El sistema no ha sido modificado. AulaCIM-10 se adapta fluidamente a esta y a cualquier otra resolución.",
                        selectedMode.dmPelsWidth, selectedMode.dmPelsHeight, selectedMode.dmDisplayFrequency),
                        "Compatibilidad Confirmada", MessageBoxButtons.OK, MessageBoxIcon.Information);
                }
                else
                {
                    MessageBox.Show("El hardware reporta que este modo requiere reinicio o no está optimizado para el adaptador actual.", "Aviso de Compatibilidad", MessageBoxButtons.OK, MessageBoxIcon.Warning);
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show("Error durante la prueba de compatibilidad: " + ex.Message, "Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }
    }
}
